import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { instancedBufferAttribute, uniform as tslUniform } from "three/tsl";
import {
  AdditiveBlending,
  Color,
  InstancedBufferAttribute,
  PointsNodeMaterial,
  type Sprite,
} from "three/webgpu";

import { type DendriteSegment } from "./base";
import { DEFAULT_DEPOLARIZATION_BAND_WIDTH } from "./depolarizationShared";
import { kEffluxDrive, naInfluxDrive } from "./hhModel";
import { type NeuronSimSampler } from "./useNeuronWaveformSampler";

const TWO_PI = Math.PI * 2;
const FRAME_STEPS = 72;

type DepolarizationSettings = {
  particleCount: number;
  particleSize: number;
  wavePeriodSec: number;
  travelFraction: number;
  bandWidth: number;
  preInrushLeadSec: number;
  sleeveInnerGap: number;
  sleeveThickness: number;
  inrushDurationSec: number;
  color: string;
  effluxEnabled: boolean;
  effluxColor: string;
  effluxLagDistance: number;
  effluxParticleFraction: number;
};

const DEFAULT_SETTINGS: DepolarizationSettings = {
  particleCount: 100_000,
  particleSize: 0.075,
  wavePeriodSec: 4.4,
  travelFraction: 0.78,
  bandWidth: DEFAULT_DEPOLARIZATION_BAND_WIDTH,
  preInrushLeadSec: 0.62,
  sleeveInnerGap: 0.34,
  sleeveThickness: 0.78,
  inrushDurationSec: 1.25,
  color: "#9dfcff",
  effluxEnabled: false,
  effluxColor: "#ff9ec8",
  effluxLagDistance: 1.35,
  effluxParticleFraction: 0.35,
};

type SegmentFrames = ReturnType<
  DendriteSegment["curve"]["computeFrenetFrames"]
>;

type SegmentSample = {
  segment: DendriteSegment;
  frames: SegmentFrames;
  length: number;
  startDistance: number;
};

type ParticleField = {
  samples: SegmentSample[];
  totalLength: number;
  maxDistance: number;
  segmentIndices: Uint16Array;
  localT: Float32Array;
  angles: Float32Array;
  radialOffsets: Float32Array;
  axialJitter: Float32Array;
  radialJitter: Float32Array;
  phaseJitter: Float32Array;
  speedJitter: Float32Array;
  intensity: Float32Array;
  isEfflux: Uint8Array;
};

const random = (seed: number) => MathUtils.seededRandom(seed);

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
};

const buildSegmentSamples = (segments: DendriteSegment[]) => {
  const distancesById = new Map<
    string,
    { length: number; startDistance: number }
  >();

  return segments.map((segment) => {
    const length = segment.curve.getLength();
    const parentDistance = segment.parentId
      ? distancesById.get(segment.parentId)
      : undefined;
    const startDistance = parentDistance
      ? parentDistance.startDistance + parentDistance.length
      : 0;

    distancesById.set(segment.id, { length, startDistance });

    return {
      segment,
      frames: segment.curve.computeFrenetFrames(FRAME_STEPS, false),
      length,
      startDistance,
    };
  });
};

const buildParticleField = (
  segments: DendriteSegment[],
  settings: DepolarizationSettings,
): ParticleField => {
  const samples = buildSegmentSamples(segments);
  const cumulativeLengths = new Float32Array(samples.length);
  let totalLength = 0;
  let maxDistance = 0;

  samples.forEach((sample, index) => {
    totalLength += sample.length;
    cumulativeLengths[index] = totalLength;
    maxDistance = Math.max(maxDistance, sample.startDistance + sample.length);
  });

  const segmentIndices = new Uint16Array(settings.particleCount);
  const localT = new Float32Array(settings.particleCount);
  const angles = new Float32Array(settings.particleCount);
  const radialOffsets = new Float32Array(settings.particleCount);
  const axialJitter = new Float32Array(settings.particleCount);
  const radialJitter = new Float32Array(settings.particleCount);
  const phaseJitter = new Float32Array(settings.particleCount);
  const speedJitter = new Float32Array(settings.particleCount);
  const intensity = new Float32Array(settings.particleCount);
  const isEfflux = new Uint8Array(settings.particleCount);

  const effluxCount =
    settings.effluxEnabled && settings.effluxParticleFraction > 0
      ? Math.min(
          settings.particleCount,
          Math.floor(
            settings.particleCount * settings.effluxParticleFraction,
          ),
        )
      : 0;

  for (let i = 0; i < settings.particleCount; i += 1) {
    const eff = i < effluxCount ? 1 : 0;
    isEfflux[i] = eff;
    const es = eff * 901_333;

    const distancePick = random(9301 + i * 17) * totalLength;
    let segmentIndex = 0;

    while (
      segmentIndex < cumulativeLengths.length - 1 &&
      distancePick > cumulativeLengths[segmentIndex]
    ) {
      segmentIndex += 1;
    }

    segmentIndices[i] = segmentIndex;
    localT[i] = random(14033 + i * 23 + es);
    angles[i] = random(20939 + i * 31 + es) * TWO_PI;
    radialOffsets[i] =
      settings.sleeveInnerGap +
      settings.sleeveThickness * (0.16 + 0.84 * random(28057 + i * 43 + es));
    axialJitter[i] = random(31249 + i * 41 + es) * 2 - 1;
    radialJitter[i] = 0.78 + 0.44 * random(33289 + i * 37 + es);
    phaseJitter[i] = random(35027 + i * 29 + es) * TWO_PI;
    speedJitter[i] = 0.76 + 0.48 * random(44071 + i * 53 + es);
    intensity[i] = 0.55 + 0.45 * random(52081 + i * 59 + es);
  }

  return {
    samples,
    totalLength,
    maxDistance,
    segmentIndices,
    localT,
    angles,
    radialOffsets,
    axialJitter,
    radialJitter,
    phaseJitter,
    speedJitter,
    intensity,
    isEfflux,
  };
};

export const DepolarizationParticlesCpu = ({
  segments,
  particleCount = DEFAULT_SETTINGS.particleCount,
  particleSize = DEFAULT_SETTINGS.particleSize,
  wavePeriodSec = DEFAULT_SETTINGS.wavePeriodSec,
  travelFraction = DEFAULT_SETTINGS.travelFraction,
  bandWidth = DEFAULT_SETTINGS.bandWidth,
  preInrushLeadSec = DEFAULT_SETTINGS.preInrushLeadSec,
  sleeveInnerGap = DEFAULT_SETTINGS.sleeveInnerGap,
  sleeveThickness = DEFAULT_SETTINGS.sleeveThickness,
  inrushDurationSec = DEFAULT_SETTINGS.inrushDurationSec,
  color = DEFAULT_SETTINGS.color,
  effluxEnabled = DEFAULT_SETTINGS.effluxEnabled,
  effluxColor = DEFAULT_SETTINGS.effluxColor,
  effluxLagDistance = DEFAULT_SETTINGS.effluxLagDistance,
  effluxParticleFraction = DEFAULT_SETTINGS.effluxParticleFraction,
  samplerRef,
}: {
  segments: DendriteSegment[];
  samplerRef: RefObject<NeuronSimSampler | null>;
} & Partial<DepolarizationSettings>) => {
  const spriteRef = useRef<Sprite>(null);
  const posAttrRef = useRef<InstancedBufferAttribute | null>(null);
  const colorAttrRef = useRef<InstancedBufferAttribute | null>(null);
  const sizeNodeRef = useRef(tslUniform(particleSize));
  const bandSmoothRef = useRef<number | null>(null);
  const glowColor = useMemo(() => new Color(color), [color]);
  const effluxGlowColor = useMemo(() => new Color(effluxColor), [effluxColor]);
  const settings = useMemo(
    () => ({
      particleCount,
      particleSize,
      wavePeriodSec,
      travelFraction,
      bandWidth,
      preInrushLeadSec,
      sleeveInnerGap,
      sleeveThickness,
      inrushDurationSec,
      color,
      effluxEnabled,
      effluxColor,
      effluxLagDistance,
      effluxParticleFraction,
    }),
    [
      particleCount,
      particleSize,
      wavePeriodSec,
      travelFraction,
      bandWidth,
      preInrushLeadSec,
      sleeveInnerGap,
      sleeveThickness,
      inrushDurationSec,
      color,
      effluxEnabled,
      effluxColor,
      effluxLagDistance,
      effluxParticleFraction,
    ],
  );
  const field = useMemo(
    () => buildParticleField(segments, settings),
    [segments, settings],
  );

  useEffect(() => {
    const sprite = spriteRef.current;
    if (!sprite) {
      return;
    }

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 4);
    const posAttr = new InstancedBufferAttribute(positions, 3);
    const colorAttr = new InstancedBufferAttribute(colors, 4);
    posAttrRef.current = posAttr;
    colorAttrRef.current = colorAttr;

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const material = new PointsNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending as any,
      sizeNode: sizeNodeRef.current as any,
    });
    (material as any).positionNode = instancedBufferAttribute(posAttr);
    (material as any).colorNode = instancedBufferAttribute(colorAttr, "vec4");
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    sprite.material = material;
    sprite.count = particleCount;
    sprite.frustumCulled = false;

    return () => {
      material.dispose();
      posAttrRef.current = null;
      colorAttrRef.current = null;
    };
  }, [particleCount]);

  useFrame(({ elapsed, delta }) => {
    const posAttr = posAttrRef.current;
    const colorAttr = colorAttrRef.current;
    const sim = samplerRef.current;
    if (!posAttr || !colorAttr || field.samples.length === 0 || !sim) {
      return;
    }

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const drives = sim.getSmoothedDrives();

    const vNorm = MathUtils.clamp((drives.vmSlow + 26) / 92, 0, 1);
    const span = field.maxDistance + bandWidth;
    const na = drives.na * 0.35 + drives.naSlow * 0.65;
    const k = drives.k * 0.35 + drives.kSlow * 0.65;
    const axial = MathUtils.clamp(
      0.34 + 0.44 * vNorm + 0.15 * na - 0.1 * k,
      0.18,
      0.62,
    );
    const wobble = 0.032 * Math.sin(elapsed * 0.52);
    const rawBand = MathUtils.clamp(
      -bandWidth * 0.5 + span * (axial + wobble),
      -bandWidth * 0.35,
      -bandWidth * 0.5 + span * 0.62,
    );
    const dt = Math.min(delta, 0.1);
    const bandA = 1 - Math.exp(-dt * 3.8);
    const prevB = bandSmoothRef.current;
    bandSmoothRef.current =
      prevB === null ? rawBand : prevB + bandA * (rawBand - prevB);
    const waveDistanceSim = bandSmoothRef.current;

    const waveSpeedSim = (field.maxDistance + bandWidth) / 3.2;
    const effluxLag = effluxEnabled ? effluxLagDistance : 0;
    const center = new Vector3();
    const normal = new Vector3();
    const binormal = new Vector3();
    const tangent = new Vector3();
    const radialDirection = new Vector3();

    sizeNodeRef.current.value = particleSize;

    for (let i = 0; i < particleCount; i += 1) {
      const sample = field.samples[field.segmentIndices[i]];
      const t = field.localT[i];
      const isEff = field.isEfflux[i] === 1;
      const waveDistance = waveDistanceSim;
      const waveSpeed = waveSpeedSim;
      const bandCenter = isEff ? waveDistance - effluxLag : waveDistance;
      const tint = isEff ? effluxGlowColor : glowColor;
      const distance = sample.startDistance + sample.length * t;
      const organicDistance =
        distance +
        field.axialJitter[i] * bandWidth * 0.32 +
        Math.sin(elapsed * 1.65 + field.phaseJitter[i]) * bandWidth * 0.08;

      const tau = Math.max(0, organicDistance * sim.conductionMsPerWorldUnit);
      const hist = isEff ? sim.sampleEfflux(tau) : sim.sample(tau);
      const localDrive = isEff
        ? kEffluxDrive(hist.IK)
        : naInfluxDrive(hist.INa);
      const gateAlpha = 1;
      const ionWeightMul = MathUtils.clamp(
        0.28 + 0.72 * localDrive,
        0.22,
        1,
      );
      const naR = drives.na * 0.4 + drives.naSlow * 0.6;
      const kR = drives.k * 0.4 + drives.kSlow * 0.6;
      const rateBoost =
        0.38 +
        0.62 *
          (isEff
            ? Math.max(localDrive, kR * 0.55)
            : Math.max(localDrive, naR * 0.55));
      const effInrushSec =
        inrushDurationSec / MathUtils.clamp(rateBoost, 0.45, 1.85);
      const arrivalAge = (bandCenter - organicDistance) / waveSpeed;
      const inrushProgress = MathUtils.clamp(
        (arrivalAge * field.speedJitter[i]) / effInrushSec,
        0,
        1,
      );

      const posIndex = i * 3;
      const colorIndex = i * 4;

      const frameT = t * FRAME_STEPS;
      const frameIndex = Math.min(FRAME_STEPS - 1, Math.floor(frameT));
      const frameMix = frameT - frameIndex;
      const baseExp = isEff ? 0.36 : 0.42;
      const expTweak = MathUtils.clamp(0.06 * drives.dVmSlow, 0, 0.07);
      const easedInrush = Math.pow(inrushProgress, baseExp - expTweak);
      const radiusAtT = MathUtils.lerp(
        sample.segment.radiusStart,
        sample.segment.radiusEnd,
        t,
      );
      const outerR = radiusAtT + field.radialOffsets[i] * field.radialJitter[i];
      const innerR = -radiusAtT * (0.18 + 0.3 * field.radialJitter[i]);
      const radialDistance = isEff
        ? MathUtils.lerp(innerR, outerR, easedInrush)
        : MathUtils.lerp(outerR, innerR, easedInrush);
      const spinMul = 1 + 0.2 * drives.dVmSlow;
      const angle =
        field.angles[i] +
        elapsed * (0.45 + field.speedJitter[i] * 0.18) * spinMul;

      sample.segment.curve.getPointAt(t, center);
      sample.segment.curve.getTangentAt(t, tangent);
      center.addScaledVector(tangent, field.axialJitter[i] * bandWidth * 0.04);
      normal
        .copy(sample.frames.normals[frameIndex])
        .lerp(sample.frames.normals[frameIndex + 1], frameMix)
        .normalize();
      binormal
        .copy(sample.frames.binormals[frameIndex])
        .lerp(sample.frames.binormals[frameIndex + 1], frameMix)
        .normalize();
      radialDirection
        .copy(normal)
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(binormal, Math.sin(angle))
        .normalize();
      center.addScaledVector(radialDirection, radialDistance);

      const spawnRamp = smoothstep(-preInrushLeadSec, 0.18, arrivalAge);
      const inrushGlow = smoothstep(0, 0.86, inrushProgress);
      const intensityRamp = MathUtils.lerp(
        0.2,
        1,
        Math.max(spawnRamp, inrushGlow),
      );
      const alpha =
        gateAlpha * intensityRamp * field.intensity[i] * 0.95 * ionWeightMul;
      positions[posIndex] = center.x;
      positions[posIndex + 1] = center.y;
      positions[posIndex + 2] = center.z;
      colors[colorIndex] = tint.r;
      colors[colorIndex + 1] = tint.g;
      colors[colorIndex + 2] = tint.b;
      colors[colorIndex + 3] = alpha;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  return (
    <sprite
      ref={spriteRef as RefObject<Sprite>}
      count={particleCount}
      frustumCulled={false}
    />
  );
};
