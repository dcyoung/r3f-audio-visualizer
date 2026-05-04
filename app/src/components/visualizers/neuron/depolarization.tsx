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

const TWO_PI = Math.PI * 2;
const FRAME_STEPS = 72;

type DepolarizationSettings = {
  particleCount: number;
  particleSize: number;
  wavePeriodSec: number;
  travelFraction: number;
  bandWidth: number;
  sleeveInnerGap: number;
  sleeveThickness: number;
  inrushDurationSec: number;
  color: string;
};

const DEFAULT_SETTINGS: DepolarizationSettings = {
  particleCount: 12000,
  particleSize: 0.075,
  wavePeriodSec: 4.4,
  travelFraction: 0.78,
  bandWidth: 1.8,
  sleeveInnerGap: 0.42,
  sleeveThickness: 0.95,
  inrushDurationSec: 0.72,
  color: "#9dfcff",
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
  gates: Float32Array;
  speedJitter: Float32Array;
  intensity: Float32Array;
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
  const gates = new Float32Array(settings.particleCount);
  const speedJitter = new Float32Array(settings.particleCount);
  const intensity = new Float32Array(settings.particleCount);

  for (let i = 0; i < settings.particleCount; i += 1) {
    const distancePick = random(9301 + i * 17) * totalLength;
    let segmentIndex = 0;

    while (
      segmentIndex < cumulativeLengths.length - 1 &&
      distancePick > cumulativeLengths[segmentIndex]
    ) {
      segmentIndex += 1;
    }

    segmentIndices[i] = segmentIndex;
    localT[i] = random(14033 + i * 23);
    angles[i] = random(20939 + i * 31) * TWO_PI;
    radialOffsets[i] =
      settings.sleeveInnerGap +
      settings.sleeveThickness * (0.16 + 0.84 * random(28057 + i * 43));
    gates[i] = 0.08 + 0.56 * random(36061 + i * 47);
    speedJitter[i] = 0.76 + 0.48 * random(44071 + i * 53);
    intensity[i] = 0.55 + 0.45 * random(52081 + i * 59);
  }

  return {
    samples,
    totalLength,
    maxDistance,
    segmentIndices,
    localT,
    angles,
    radialOffsets,
    gates,
    speedJitter,
    intensity,
  };
};

export const DepolarizationParticles = ({
  segments,
  particleCount = DEFAULT_SETTINGS.particleCount,
  particleSize = DEFAULT_SETTINGS.particleSize,
  wavePeriodSec = DEFAULT_SETTINGS.wavePeriodSec,
  travelFraction = DEFAULT_SETTINGS.travelFraction,
  bandWidth = DEFAULT_SETTINGS.bandWidth,
  sleeveInnerGap = DEFAULT_SETTINGS.sleeveInnerGap,
  sleeveThickness = DEFAULT_SETTINGS.sleeveThickness,
  inrushDurationSec = DEFAULT_SETTINGS.inrushDurationSec,
  color = DEFAULT_SETTINGS.color,
}: {
  segments: DendriteSegment[];
} & Partial<DepolarizationSettings>) => {
  const spriteRef = useRef<Sprite>(null);
  const posAttrRef = useRef<InstancedBufferAttribute | null>(null);
  const colorAttrRef = useRef<InstancedBufferAttribute | null>(null);
  const sizeNodeRef = useRef(tslUniform(particleSize));
  const glowColor = useMemo(() => new Color(color), [color]);
  const settings = useMemo(
    () => ({
      particleCount,
      particleSize,
      wavePeriodSec,
      travelFraction,
      bandWidth,
      sleeveInnerGap,
      sleeveThickness,
      inrushDurationSec,
      color,
    }),
    [
      particleCount,
      particleSize,
      wavePeriodSec,
      travelFraction,
      bandWidth,
      sleeveInnerGap,
      sleeveThickness,
      inrushDurationSec,
      color,
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

  useFrame(({ elapsed }) => {
    const posAttr = posAttrRef.current;
    const colorAttr = colorAttrRef.current;
    if (!posAttr || !colorAttr || field.samples.length === 0) {
      return;
    }

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const travelSec = wavePeriodSec * travelFraction;
    const cycleTime = elapsed % wavePeriodSec;
    const waveProgress = MathUtils.clamp(cycleTime / travelSec, 0, 1);
    const waveDistance =
      -bandWidth * 0.5 + waveProgress * (field.maxDistance + bandWidth);
    const waveSpeed = (field.maxDistance + bandWidth) / travelSec;
    const hiddenZ = -1000;
    const center = new Vector3();
    const normal = new Vector3();
    const binormal = new Vector3();
    const radialDirection = new Vector3();

    sizeNodeRef.current.value = particleSize;

    for (let i = 0; i < particleCount; i += 1) {
      const sample = field.samples[field.segmentIndices[i]];
      const t = field.localT[i];
      const distance = sample.startDistance + sample.length * t;
      const bandOffset = Math.abs(distance - waveDistance);
      const bandAlpha = Math.exp(-Math.pow(bandOffset / (bandWidth * 0.42), 2));
      const gateAlpha = smoothstep(field.gates[i], 1, bandAlpha);
      const arrivalAge = (waveDistance - distance) / waveSpeed;
      const inrushProgress = MathUtils.clamp(
        (arrivalAge * field.speedJitter[i]) / inrushDurationSec,
        0,
        1,
      );
      const visible =
        cycleTime <= travelSec &&
        arrivalAge >= -0.08 &&
        arrivalAge <= inrushDurationSec / field.speedJitter[i] &&
        gateAlpha > 0.001;
      const posIndex = i * 3;
      const colorIndex = i * 4;

      if (!visible) {
        positions[posIndex] = 0;
        positions[posIndex + 1] = 0;
        positions[posIndex + 2] = hiddenZ;
        colors[colorIndex] = glowColor.r;
        colors[colorIndex + 1] = glowColor.g;
        colors[colorIndex + 2] = glowColor.b;
        colors[colorIndex + 3] = 0;
        continue;
      }

      const frameT = t * FRAME_STEPS;
      const frameIndex = Math.min(FRAME_STEPS - 1, Math.floor(frameT));
      const frameMix = frameT - frameIndex;
      const easedInrush =
        inrushProgress * inrushProgress * (3 - 2 * inrushProgress);
      const radiusAtT = MathUtils.lerp(
        sample.segment.radiusStart,
        sample.segment.radiusEnd,
        t,
      );
      const radialDistance = MathUtils.lerp(
        radiusAtT + field.radialOffsets[i],
        radiusAtT * 0.16,
        easedInrush,
      );
      const angle =
        field.angles[i] + elapsed * (0.45 + field.speedJitter[i] * 0.18);

      sample.segment.curve.getPointAt(t, center);
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

      const fadeOut = 1 - smoothstep(0.72, 1, inrushProgress);
      const alpha = gateAlpha * fadeOut * field.intensity[i] * 0.95;
      positions[posIndex] = center.x;
      positions[posIndex + 1] = center.y;
      positions[posIndex + 2] = center.z;
      colors[colorIndex] = glowColor.r;
      colors[colorIndex + 1] = glowColor.g;
      colors[colorIndex + 2] = glowColor.b;
      colors[colorIndex + 3] = alpha;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  return <sprite ref={spriteRef as RefObject<Sprite>} frustumCulled={false} />;
};
