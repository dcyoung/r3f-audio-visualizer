/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import {
  clamp,
  cos,
  float,
  floor,
  Fn,
  int,
  ivec2,
  max,
  min,
  mix,
  mod,
  pow,
  select,
  sin,
  smoothstep,
  textureLoad,
  vec3,
  vec4,
} from "three/tsl";
import type { DataTexture } from "three/webgpu";

/** Must match frenet bake resolution in `depolarization.tsx`. */
export const NEURON_PARTICLE_FRAME_STEPS = 72;

const EPS = float(1e-6);

export type NeuronDepolarizationUniforms = {
  uTime: any;
  uPhaseMs: any;
  uBandCenter: any;
  uDriveNa: any;
  uDriveK: any;
  uDriveNaSlow: any;
  uDriveKSlow: any;
  uDriveVmSlow: any;
  uDriveDvSlow: any;
  uMaxDistance: any;
  uBandWidth: any;
  uWaveSpeedSim: any;
  uPreInrushLeadSec: any;
  uInrushDurationSec: any;
  uEffluxLagDistance: any;
  uEffluxLagMs: any;
  uConductionMsPerWorldUnit: any;
  uVRest: any;
  uVmAmp: any;
  uTauVmFast: any;
  uTauVmSlow: any;
  uTauNa: any;
  uAmpNa: any;
  uTauK: any;
  uAmpK: any;
  uKDelayMs: any;
  uWaveformDurationMs: any;
  uRepeatPeriodMs: any;
  /** LUT columns − 1 (see `depolarizationApDrive.ts`). */
  uApDriveLutSize: any;
  uInfluxColor: any;
  uEffluxColor: any;
  uParticleSize: any;
  /** Multiplies final alpha (tones down additive stack when particle count is high). */
  uParticleIntensityScale: any;
};

/**
 * `Sprite` + `PointsNodeMaterial`: use **two `Fn`s** (position `vec3`, color `vec4`); avoid
 * `outputStruct`+`.element()` on this stack (breaks instancing). Atlases: **`textureLoad(DataTexture, ivec2, level)`**
 * Ion drives: sample **`depolarizationApDrive`** LUT (CPU-filled from `evaluateApproximateAp` +
 * `naInfluxDrive` / `kEffluxDrive`) so GPU matches CPU `sample(tau)` energy, including distal tips.
 */
export function buildDepolarizationNodes(
  aIdxT: any,
  aJit: any,
  aSpd: any,
  u: NeuronDepolarizationUniforms,
  framesTex: DataTexture,
  scalarsTex: DataTexture,
  apDriveLut: DataTexture,
) {
  const readVec3 = (seg: any, frame: any, channel: any) =>
    textureLoad(framesTex, ivec2(frame.mul(4).add(channel), seg), int(0)).xyz;

  const readScalars = (seg: any) =>
    textureLoad(scalarsTex, ivec2(int(0), seg), int(0));

  const positionNode = Fn(() => {
    const segmentIndex = int(aIdxT.x);
    const localT = float(aIdxT.y);
    const angle0 = float(aIdxT.z);
    const radialOff = float(aIdxT.w);

    const axialJitter = float(aJit.x);
    const radialJitter = float(aJit.y);
    const phaseJitter = float(aJit.z);
    void aJit.w;

    const speedJitter = float(aSpd.x);
    const intensity = float(aSpd.y);
    const isEfflux = aSpd.z;

    const scal = readScalars(segmentIndex);
    const startDistance = float(scal.x);
    const segLength = float(scal.y);
    const radiusStart = float(scal.z);
    const radiusEnd = float(scal.w);

    const frameSteps = float(NEURON_PARTICLE_FRAME_STEPS);
    const frameT = localT.mul(frameSteps);
    const idx0f = min(float(NEURON_PARTICLE_FRAME_STEPS - 1), floor(frameT));
    const idx0 = int(idx0f);
    const idx1 = idx0.add(1);
    const frameMix = frameT.sub(idx0f);

    const p0 = readVec3(segmentIndex, idx0, int(0));
    const p1 = readVec3(segmentIndex, idx1, int(0));
    const tan0 = readVec3(segmentIndex, idx0, int(1));
    const tan1 = readVec3(segmentIndex, idx1, int(1));
    const n0 = readVec3(segmentIndex, idx0, int(2));
    const n1 = readVec3(segmentIndex, idx1, int(2));
    const b0 = readVec3(segmentIndex, idx0, int(3));
    const b1 = readVec3(segmentIndex, idx1, int(3));

    const center = mix(p0, p1, frameMix).toVar("dplCenter");
    const tangent = mix(tan0, tan1, frameMix).normalize().toVar("dplTan");
    const normal = mix(n0, n1, frameMix).normalize().toVar("dplN");
    const binormal = mix(b0, b1, frameMix).normalize().toVar("dplB");

    const bandWidth = float(u.uBandWidth);
    const time = float(u.uTime);
    const waveSpeed = max(float(u.uWaveSpeedSim), EPS);

    const distance = startDistance.add(segLength.mul(localT));
    const organicDistance = distance
      .add(axialJitter.mul(bandWidth).mul(float(0.32)))
      .add(
        sin(time.mul(float(1.65)).add(phaseJitter)).mul(bandWidth).mul(float(0.08)),
      );

    const tau = max(organicDistance.mul(u.uConductionMsPerWorldUnit), float(0));
    const effluxLag = u.uEffluxLagMs;

    const phaseBase = u.uPhaseMs.sub(tau);
    const phaseEff = phaseBase.sub(effluxLag);
    const phaseUse = select(isEfflux.greaterThan(float(0.5)), phaseEff, phaseBase);

    const repeatSafe = max(u.uRepeatPeriodMs, float(1));
    const tWrapped = mod(phaseUse, repeatSafe);
    const inactive = tWrapped.greaterThanEqual(u.uWaveformDurationMs);

    const phaseNorm = tWrapped.div(repeatSafe);
    const phaseBinF = phaseNorm.mul(float(u.uApDriveLutSize));
    const phaseBin = int(min(floor(phaseBinF), float(u.uApDriveLutSize)));
    const drivePix = textureLoad(apDriveLut, ivec2(phaseBin, int(0)), int(0));
    const naInfluxRaw = float(drivePix.x);
    const kEffluxRaw = float(drivePix.y);
    const naInflux = select(inactive, float(0), naInfluxRaw);
    const kEfflux = select(inactive, float(0), kEffluxRaw);

    const localDrive = select(
      isEfflux.greaterThan(float(0.5)),
      kEfflux,
      naInflux,
    );

    const gateAlpha = float(1);
    const ionWeightMul = clamp(
      float(0.28).add(float(0.72).mul(localDrive)),
      float(0.22),
      float(1),
    );

    const naR = u.uDriveNa.mul(float(0.4)).add(u.uDriveNaSlow.mul(float(0.6)));
    const kR = u.uDriveK.mul(float(0.4)).add(u.uDriveKSlow.mul(float(0.6)));
    const rateBoost = float(0.38).add(
      float(0.62).mul(
        select(
          isEfflux.greaterThan(float(0.5)),
          max(localDrive, kR.mul(float(0.55))),
          max(localDrive, naR.mul(float(0.55))),
        ),
      ),
    );
    const effInrushSec = u.uInrushDurationSec.div(
      clamp(rateBoost, float(0.45), float(1.85)),
    );

    const waveDist = float(u.uBandCenter);
    const effluxLagDist = float(u.uEffluxLagDistance);
    const bandCenter = select(
      isEfflux.greaterThan(float(0.5)),
      waveDist.sub(effluxLagDist),
      waveDist,
    );

    const arrivalAge = bandCenter.sub(organicDistance).div(waveSpeed);
    const inrushProgress = clamp(
      arrivalAge.mul(speedJitter).div(effInrushSec),
      float(0),
      float(1),
    );

    const baseExp = select(
      isEfflux.greaterThan(float(0.5)),
      float(0.36),
      float(0.42),
    );
    const expTweak = clamp(
      u.uDriveDvSlow.mul(float(0.06)),
      float(0),
      float(0.07),
    );
    const easedInrush = pow(
      float(inrushProgress),
      float(baseExp.sub(expTweak)),
    );

    const radiusAtT = mix(radiusStart, radiusEnd, localT);
    const outerR = radiusAtT.add(radialOff.mul(radialJitter));
    const innerR = radiusAtT
      .negate()
      .mul(float(0.18).add(float(0.3).mul(radialJitter)));
    const radialDistance = select(
      isEfflux.greaterThan(float(0.5)),
      mix(innerR, outerR, easedInrush),
      mix(outerR, innerR, easedInrush),
    );

    const spinMul = float(1).add(u.uDriveDvSlow.mul(float(0.2)));
    const angle = angle0.add(
      time
        .mul(float(0.45).add(speedJitter.mul(float(0.18))))
        .mul(spinMul),
    );

    center.addAssign(
      tangent.mul(axialJitter.mul(bandWidth).mul(float(0.04))),
    );

    const cosA = cos(angle);
    const sinA = sin(angle);
    const radialDir = normal
      .mul(cosA)
      .add(binormal.mul(sinA))
      .normalize();
    center.addAssign(radialDir.mul(radialDistance));

    const spawnRamp = float(
      smoothstep(
        u.uPreInrushLeadSec.negate(),
        float(0.18),
        arrivalAge,
      ),
    );
    const inrushGlow = float(
      smoothstep(float(0), float(0.86), inrushProgress),
    );
    const intensityRamp = mix(
      float(0.2),
      float(1),
      max(spawnRamp, inrushGlow),
    );
    const alpha = float(gateAlpha)
      .mul(float(intensityRamp))
      .mul(float(intensity))
      .mul(float(0.95))
      .mul(float(ionWeightMul))
      .mul(float(u.uParticleIntensityScale));

    const hidden = float(-1000);
    return select(
      alpha.lessThanEqual(float(0.0005)),
      vec3(float(0), float(0), hidden),
      center,
    );
  })();

  const colorNode = Fn(() => {
    const segmentIndex = int(aIdxT.x);
    const localT = float(aIdxT.y);
    void aIdxT.z;
    void aIdxT.w;

    const axialJitter = float(aJit.x);
    void aJit.y;
    const phaseJitter = float(aJit.z);
    void aJit.w;

    const speedJitter = float(aSpd.x);
    const intensity = float(aSpd.y);
    const isEfflux = aSpd.z;

    const scal = readScalars(segmentIndex);
    const startDistance = float(scal.x);
    const segLength = float(scal.y);

    const bandWidth = float(u.uBandWidth);
    const time = float(u.uTime);
    const waveSpeed = max(float(u.uWaveSpeedSim), EPS);

    const distance = startDistance.add(segLength.mul(localT));
    const organicDistance = distance
      .add(axialJitter.mul(bandWidth).mul(float(0.32)))
      .add(
        sin(time.mul(float(1.65)).add(phaseJitter)).mul(bandWidth).mul(float(0.08)),
      );

    const tau = max(organicDistance.mul(u.uConductionMsPerWorldUnit), float(0));
    const effluxLag = u.uEffluxLagMs;

    const phaseBase = u.uPhaseMs.sub(tau);
    const phaseEff = phaseBase.sub(effluxLag);
    const phaseUse = select(isEfflux.greaterThan(float(0.5)), phaseEff, phaseBase);

    const repeatSafe = max(u.uRepeatPeriodMs, float(1));
    const tWrapped = mod(phaseUse, repeatSafe);
    const inactive = tWrapped.greaterThanEqual(u.uWaveformDurationMs);

    const phaseNorm = tWrapped.div(repeatSafe);
    const phaseBinF = phaseNorm.mul(float(u.uApDriveLutSize));
    const phaseBin = int(min(floor(phaseBinF), float(u.uApDriveLutSize)));
    const drivePix = textureLoad(apDriveLut, ivec2(phaseBin, int(0)), int(0));
    const naInfluxRaw = float(drivePix.x);
    const kEffluxRaw = float(drivePix.y);
    const naInflux = select(inactive, float(0), naInfluxRaw);
    const kEfflux = select(inactive, float(0), kEffluxRaw);

    const localDrive = select(
      isEfflux.greaterThan(float(0.5)),
      kEfflux,
      naInflux,
    );

    const gateAlpha = float(1);
    const ionWeightMul = clamp(
      float(0.28).add(float(0.72).mul(localDrive)),
      float(0.22),
      float(1),
    );

    const naR = u.uDriveNa.mul(float(0.4)).add(u.uDriveNaSlow.mul(float(0.6)));
    const kR = u.uDriveK.mul(float(0.4)).add(u.uDriveKSlow.mul(float(0.6)));
    const rateBoost = float(0.38).add(
      float(0.62).mul(
        select(
          isEfflux.greaterThan(float(0.5)),
          max(localDrive, kR.mul(float(0.55))),
          max(localDrive, naR.mul(float(0.55))),
        ),
      ),
    );
    const effInrushSec = u.uInrushDurationSec.div(
      clamp(rateBoost, float(0.45), float(1.85)),
    );

    const waveDist = float(u.uBandCenter);
    const effluxLagDist = float(u.uEffluxLagDistance);
    const bandCenter = select(
      isEfflux.greaterThan(float(0.5)),
      waveDist.sub(effluxLagDist),
      waveDist,
    );

    const arrivalAge = bandCenter.sub(organicDistance).div(waveSpeed);
    const inrushProgress = clamp(
      arrivalAge.mul(speedJitter).div(effInrushSec),
      float(0),
      float(1),
    );

    const spawnRamp = float(
      smoothstep(
        u.uPreInrushLeadSec.negate(),
        float(0.18),
        arrivalAge,
      ),
    );
    const inrushGlow = float(
      smoothstep(float(0), float(0.86), inrushProgress),
    );
    const intensityRamp = mix(
      float(0.2),
      float(1),
      max(spawnRamp, inrushGlow),
    );
    const alpha = float(gateAlpha)
      .mul(float(intensityRamp))
      .mul(float(intensity))
      .mul(float(0.95))
      .mul(float(ionWeightMul))
      .mul(float(u.uParticleIntensityScale));

    const tint = select(
      isEfflux.greaterThan(float(0.5)),
      u.uEffluxColor,
      u.uInfluxColor,
    );

    return vec4(tint, alpha);
  })();

  return {
    positionNode,
    colorNode,
  };
}
