import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { instancedBufferAttribute, uniform as tslUniform } from "three/tsl";
import {
  AdditiveBlending,
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  FloatType,
  InstancedBufferAttribute,
  NearestFilter,
  PointsNodeMaterial,
  RGBAFormat,
  type Sprite,
} from "three/webgpu";

import { type DendriteSegment } from "./base";
import { DEFAULT_APPROX_AP_PARAMS } from "./canonicalActionPotential";
import {
  DEFAULT_DEPOLARIZATION_BAND_WIDTH,
  DEFAULT_NEURON_PARTICLE_INTENSITY_SCALE,
  DEFAULT_NEURON_PARTICLE_TIER_INDEX,
  NEURON_PARTICLE_COUNT_TIERS,
} from "./depolarizationShared";
import {
  AP_DRIVE_LUT_SIZE,
  fillApDriveLut,
} from "./depolarizationApDrive";
import {
  buildDepolarizationNodes,
  NEURON_PARTICLE_FRAME_STEPS,
  type NeuronDepolarizationUniforms,
} from "./depolarizationNodes";
import { type NeuronSimSampler } from "./useNeuronWaveformSampler";

const F = NEURON_PARTICLE_FRAME_STEPS;
const TWO_PI = Math.PI * 2;

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
  particleCount:
    NEURON_PARTICLE_COUNT_TIERS[DEFAULT_NEURON_PARTICLE_TIER_INDEX],
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

export { DEFAULT_DEPOLARIZATION_BAND_WIDTH } from "./depolarizationShared";

type SegmentGpuSample = {
  segment: DendriteSegment;
  frames: ReturnType<DendriteSegment["curve"]["computeFrenetFrames"]>;
  length: number;
  startDistance: number;
};

const random = (seed: number) => MathUtils.seededRandom(seed);

const buildSegmentGpuSamples = (segments: DendriteSegment[]): SegmentGpuSample[] => {
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
      frames: segment.curve.computeFrenetFrames(F, false),
      length,
      startDistance,
    };
  });
};

type GpuParticlePack = {
  maxDistance: number;
  aIdxT: Float32Array;
  aJit: Float32Array;
  aSpd: Float32Array;
  framesTex: DataTexture;
  scalarsTex: DataTexture;
  dispose: () => void;
};

const bakeGpuTexturesAndAttrs = (
  segments: DendriteSegment[],
  settings: DepolarizationSettings,
): GpuParticlePack => {
  const samples = buildSegmentGpuSamples(segments);
  const cumulativeLengths = new Float32Array(samples.length);
  let totalLength = 0;
  let maxDistance = 0;

  samples.forEach((sample, index) => {
    totalLength += sample.length;
    cumulativeLengths[index] = totalLength;
    maxDistance = Math.max(maxDistance, sample.startDistance + sample.length);
  });

  const nSeg = samples.length;
  const framesW = (F + 1) * 4;
  const framesH = nSeg;
  const framesData = new Float32Array(framesW * framesH * 4);
  const scalarsData = new Float32Array(nSeg * 4);

  samples.forEach((sample, si) => {
    const { segment, frames, length, startDistance } = sample;
    const curve = segment.curve;
    scalarsData[si * 4 + 0] = startDistance;
    scalarsData[si * 4 + 1] = length;
    scalarsData[si * 4 + 2] = segment.radiusStart;
    scalarsData[si * 4 + 3] = segment.radiusEnd;

    for (let i = 0; i <= F; i += 1) {
      const t = i / F;
      const p = curve.getPointAt(t, new Vector3());
      const tg = frames.tangents[i].clone();
      const nm = frames.normals[i].clone();
      const bn = frames.binormals[i].clone();
      const write = (ch: number, v: Vector3) => {
        const x = i * 4 + ch;
        const o = (si * framesW + x) * 4;
        framesData[o] = v.x;
        framesData[o + 1] = v.y;
        framesData[o + 2] = v.z;
        framesData[o + 3] = 0;
      };
      write(0, p);
      write(1, tg);
      write(2, nm);
      write(3, bn);
    }
  });

  const framesTex = new DataTexture(framesData, framesW, framesH, RGBAFormat, FloatType);
  framesTex.minFilter = NearestFilter;
  framesTex.magFilter = NearestFilter;
  framesTex.wrapS = ClampToEdgeWrapping;
  framesTex.wrapT = ClampToEdgeWrapping;
  framesTex.flipY = false;
  framesTex.needsUpdate = true;

  const scalarsTex = new DataTexture(scalarsData, 1, nSeg, RGBAFormat, FloatType);
  scalarsTex.minFilter = NearestFilter;
  scalarsTex.magFilter = NearestFilter;
  scalarsTex.wrapS = ClampToEdgeWrapping;
  scalarsTex.wrapT = ClampToEdgeWrapping;
  scalarsTex.flipY = false;
  scalarsTex.needsUpdate = true;

  const aIdxT = new Float32Array(settings.particleCount * 4);
  const aJit = new Float32Array(settings.particleCount * 4);
  const aSpd = new Float32Array(settings.particleCount * 4);

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
    const es = eff * 901_333;

    const distancePick = random(9301 + i * 17) * totalLength;
    let segmentIndex = 0;
    while (
      segmentIndex < cumulativeLengths.length - 1 &&
      distancePick > cumulativeLengths[segmentIndex]
    ) {
      segmentIndex += 1;
    }

    const o = i * 4;
    aIdxT[o] = segmentIndex;
    aIdxT[o + 1] = random(14033 + i * 23 + es);
    aIdxT[o + 2] = random(20939 + i * 31 + es) * TWO_PI;
    aIdxT[o + 3] =
      settings.sleeveInnerGap +
      settings.sleeveThickness * (0.16 + 0.84 * random(28057 + i * 43 + es));

    aJit[o] = random(31249 + i * 41 + es) * 2 - 1;
    aJit[o + 1] = 0.78 + 0.44 * random(33289 + i * 37 + es);
    aJit[o + 2] = random(35027 + i * 29 + es) * TWO_PI;
    aJit[o + 3] = 0.08 + 0.56 * random(36061 + i * 47 + es);

    aSpd[o] = 0.76 + 0.48 * random(44071 + i * 53 + es);
    aSpd[o + 1] = 0.55 + 0.45 * random(52081 + i * 59 + es);
    aSpd[o + 2] = eff;
    aSpd[o + 3] = 0;
  }

  return {
    maxDistance,
    aIdxT,
    aJit,
    aSpd,
    framesTex,
    scalarsTex,
    dispose: () => {
      framesTex.dispose();
      scalarsTex.dispose();
    },
  };
};

function createDepolarizationUniforms(
  gpu: GpuParticlePack,
  glowColor: Color,
  effluxGlowColor: Color,
  initialParticleSize: number,
  initialIntensityScale: number,
): NeuronDepolarizationUniforms {
  const ap = DEFAULT_APPROX_AP_PARAMS;
  const bandW = DEFAULT_SETTINGS.bandWidth;
  const span = gpu.maxDistance + bandW;
  return {
    uTime: tslUniform(0),
    uPhaseMs: tslUniform(0),
    uBandCenter: tslUniform(
      gpu.maxDistance > 0 ? gpu.maxDistance * 0.35 : 2,
    ),
    uDriveNa: tslUniform(0),
    uDriveK: tslUniform(0),
    uDriveNaSlow: tslUniform(0),
    uDriveKSlow: tslUniform(0),
    uDriveVmSlow: tslUniform(0),
    uDriveDvSlow: tslUniform(0),
    uMaxDistance: tslUniform(gpu.maxDistance),
    uBandWidth: tslUniform(bandW),
    uWaveSpeedSim: tslUniform(span > 0 ? span / 3.2 : 2),
    uPreInrushLeadSec: tslUniform(DEFAULT_SETTINGS.preInrushLeadSec),
    uInrushDurationSec: tslUniform(DEFAULT_SETTINGS.inrushDurationSec),
    uEffluxLagDistance: tslUniform(0),
    uEffluxLagMs: tslUniform(0),
    uConductionMsPerWorldUnit: tslUniform(14),
    uVRest: tslUniform(ap.vRest),
    uVmAmp: tslUniform(ap.vmAmp),
    uTauVmFast: tslUniform(ap.tauVmFast),
    uTauVmSlow: tslUniform(ap.tauVmSlow),
    uTauNa: tslUniform(ap.tauNa),
    uAmpNa: tslUniform(ap.ampNa),
    uTauK: tslUniform(ap.tauK),
    uAmpK: tslUniform(ap.ampK),
    uKDelayMs: tslUniform(ap.kDelayMs),
    uWaveformDurationMs: tslUniform(ap.waveformDurationMs),
    uRepeatPeriodMs: tslUniform(ap.repeatPeriodMs),
    uApDriveLutSize: tslUniform(AP_DRIVE_LUT_SIZE - 1),
    uInfluxColor: tslUniform(new Vector3(glowColor.r, glowColor.g, glowColor.b)),
    uEffluxColor: tslUniform(
      new Vector3(effluxGlowColor.r, effluxGlowColor.g, effluxGlowColor.b),
    ),
    uParticleSize: tslUniform(initialParticleSize),
    uParticleIntensityScale: tslUniform(initialIntensityScale),
  };
}

export const DepolarizationParticlesGpu = ({
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
  particleIntensityScale = DEFAULT_NEURON_PARTICLE_INTENSITY_SCALE,
}: {
  segments: DendriteSegment[];
  samplerRef: RefObject<NeuronSimSampler | null>;
  /** Global per-particle alpha scale (lower when using high counts with additive blending). */
  particleIntensityScale?: number;
} & Partial<DepolarizationSettings>) => {
  const spriteRef = useRef<Sprite>(null);
  const bandSmoothRef = useRef<number | null>(null);
  const glowColor = useMemo(() => new Color(color), [color]);
  const effluxGlowColor = useMemo(() => new Color(effluxColor), [effluxColor]);

  /** AP drive LUT — created in `useLayoutEffect` with the points material so Strict Mode cannot dispose it while `attach` is still waiting on `rAF`. */
  const apDriveLutRef = useRef<{
    data: Float32Array;
    texture: DataTexture;
  } | null>(null);

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

  const gpuPack = useMemo(
    () => bakeGpuTexturesAndAttrs(segments, settings),
    [segments, settings],
  );

  useEffect(() => {
    return () => {
      gpuPack.dispose();
    };
  }, [gpuPack]);

  const uniformsRef = useRef<NeuronDepolarizationUniforms | null>(null);

  /** WebGPU: instanced `Sprite` + `PointsNodeMaterial`; baked atlases + `textureLoad`; split TSL `Fn`s for position/color. */
  useLayoutEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let material: PointsNodeMaterial | null = null;
    let attempts = 0;
    const maxRafAttempts = 64;
    let spriteMaterialHost: Sprite | null = null;

    const ensureApDriveLut = () => {
      if (apDriveLutRef.current !== null) {
        return;
      }
      const data = new Float32Array(AP_DRIVE_LUT_SIZE * 4);
      fillApDriveLut(data, DEFAULT_APPROX_AP_PARAMS, AP_DRIVE_LUT_SIZE);
      const texture = new DataTexture(data, AP_DRIVE_LUT_SIZE, 1, RGBAFormat, FloatType);
      texture.minFilter = NearestFilter;
      texture.magFilter = NearestFilter;
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.flipY = false;
      texture.needsUpdate = true;
      apDriveLutRef.current = { data, texture };
    };

    const attach = () => {
      if (cancelled) {
        return;
      }
      ensureApDriveLut();
      const sprite = spriteRef.current;
      if (!sprite) {
        attempts += 1;
        if (attempts < maxRafAttempts) {
          rafId = requestAnimationFrame(attach);
        }
        return;
      }

      const uniforms = createDepolarizationUniforms(
        gpuPack,
        glowColor,
        effluxGlowColor,
        particleSize,
        /* Initial value; `useFrame` applies live `particleIntensityScale` without rebuilding materials. */
        1,
      );
      uniformsRef.current = uniforms;

      const aIdxTAttr = new InstancedBufferAttribute(gpuPack.aIdxT, 4);
      const aJitAttr = new InstancedBufferAttribute(gpuPack.aJit, 4);
      const aSpdAttr = new InstancedBufferAttribute(gpuPack.aSpd, 4);

      const aIdxTNode = instancedBufferAttribute(aIdxTAttr, "vec4");
      const aJitNode = instancedBufferAttribute(aJitAttr, "vec4");
      const aSpdNode = instancedBufferAttribute(aSpdAttr, "vec4");

      /* eslint-disable @typescript-eslint/no-unsafe-assignment -- TSL node types */
      const apLut = apDriveLutRef.current;
      if (apLut === null) {
        return;
      }
      const { positionNode, colorNode } = buildDepolarizationNodes(
        aIdxTNode,
        aJitNode,
        aSpdNode,
        uniforms,
        gpuPack.framesTex,
        gpuPack.scalarsTex,
        apLut.texture,
      );
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */

      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      material = new PointsNodeMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending as any,
        sizeNode: uniforms.uParticleSize,
      });
      (material as any).positionNode = positionNode;
      (material as any).colorNode = colorNode;
      /* Match CPU: no custom opacityNode — NodeMaterial multiplies color.a by opacityNode; wiring opacityNode=color.a squares alpha (much dimmer). */
      material.needsUpdate = true;
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

      spriteMaterialHost = sprite;
      sprite.material = material;
      sprite.count = particleCount;
      sprite.frustumCulled = false;
      sprite.renderOrder = 8;
    };

    attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (spriteMaterialHost) {
        spriteMaterialHost.material = null as never;
      }
      material?.dispose();
      uniformsRef.current = null;
      apDriveLutRef.current?.texture.dispose();
      apDriveLutRef.current = null;
    };
  }, [gpuPack, particleCount, glowColor, effluxGlowColor, particleSize]);

  useFrame(({ elapsed, delta }) => {
    const sim = samplerRef.current;
    const uniforms = uniformsRef.current;
    if (!sim || !uniforms || segments.length === 0) {
      return;
    }

    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- TSL uniform nodes */
    const drives = sim.getSmoothedDrives();
    const span = gpuPack.maxDistance + bandWidth;
    const vNorm = MathUtils.clamp((drives.vmSlow + 26) / 92, 0, 1);
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

    const p = sim.getApproxParams();
    const apLut = apDriveLutRef.current;
    if (apLut) {
      fillApDriveLut(apLut.data, p, AP_DRIVE_LUT_SIZE);
      apLut.texture.needsUpdate = true;
    }
    const waveSpeedSim = (gpuPack.maxDistance + bandWidth) / 3.2;

    uniforms.uTime.value = elapsed;
    uniforms.uPhaseMs.value = sim.getPhaseMs();
    uniforms.uBandCenter.value = waveDistanceSim;
    uniforms.uDriveNa.value = drives.na;
    uniforms.uDriveK.value = drives.k;
    uniforms.uDriveNaSlow.value = drives.naSlow;
    uniforms.uDriveKSlow.value = drives.kSlow;
    uniforms.uDriveVmSlow.value = drives.vmSlow;
    uniforms.uDriveDvSlow.value = drives.dVmSlow;
    uniforms.uMaxDistance.value = gpuPack.maxDistance;
    uniforms.uBandWidth.value = bandWidth;
    uniforms.uWaveSpeedSim.value = waveSpeedSim;
    uniforms.uPreInrushLeadSec.value = preInrushLeadSec;
    uniforms.uInrushDurationSec.value = inrushDurationSec;
    uniforms.uEffluxLagDistance.value = effluxEnabled ? effluxLagDistance : 0;
    uniforms.uEffluxLagMs.value = sim.effluxLagMs;
    uniforms.uConductionMsPerWorldUnit.value = sim.conductionMsPerWorldUnit;
    uniforms.uVRest.value = p.vRest;
    uniforms.uVmAmp.value = p.vmAmp;
    uniforms.uTauVmFast.value = p.tauVmFast;
    uniforms.uTauVmSlow.value = p.tauVmSlow;
    uniforms.uTauNa.value = p.tauNa;
    uniforms.uAmpNa.value = p.ampNa;
    uniforms.uTauK.value = p.tauK;
    uniforms.uAmpK.value = p.ampK;
    uniforms.uKDelayMs.value = p.kDelayMs;
    uniforms.uWaveformDurationMs.value = p.waveformDurationMs;
    uniforms.uRepeatPeriodMs.value = p.repeatPeriodMs;
    uniforms.uInfluxColor.value.set(glowColor.r, glowColor.g, glowColor.b);
    uniforms.uEffluxColor.value.set(
      effluxGlowColor.r,
      effluxGlowColor.g,
      effluxGlowColor.b,
    );
    uniforms.uParticleSize.value = particleSize;
    uniforms.uParticleIntensityScale.value = particleIntensityScale;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  });

  return (
    <sprite
      ref={spriteRef as RefObject<Sprite>}
      count={particleCount}
      frustumCulled={false}
    />
  );
};
