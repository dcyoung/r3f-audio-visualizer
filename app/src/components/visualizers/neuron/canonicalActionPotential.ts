import { MathUtils } from "three";

import { type TStepData } from "./hhModel";

/** Unimodal α-kernel, peak = 1 at t = tau. */
export function alphaKernel(t: number, tau: number): number {
  if (t <= 0 || tau <= 0) {
    return 0;
  }
  const x = t / tau;
  return x * Math.exp(1 - x);
}

const positiveMod = (n: number, m: number): number => ((n % m) + m) % m;

/**
 * Intrinsic AP bump (Na/K/Vm) is authored on [0, this many ms]; it is stretched to
 * fill `waveformDurationMs` so long axon conduction delays still see a pulse.
 */
export const AP_SHAPE_REFERENCE_MS = 10.5;

export type ApproxApParams = {
  /**
   * Excitation window in phase-ms: for `t` in [0, this), currents/Vm follow one
   * stretched AP; must be large enough vs `conductionMsPerWorldUnit × axon length`
   * so the traveling wave is visible along the fiber.
   */
  waveformDurationMs: number;
  /** Cycle length in phase-ms (wall clock mapped 1:1 by default). */
  repeatPeriodMs: number;
  vRest: number;
  /** Scales the Vm bump from difference-of-exponentials. */
  vmAmp: number;
  tauVmFast: number;
  tauVmSlow: number;
  tauNa: number;
  /** Inward Na magnitude (positive); INa = -ampNa * alphaNa. */
  ampNa: number;
  tauK: number;
  /** Outward K magnitude; IK = ampK * alphaK. */
  ampK: number;
  /** Delay of K α-pulse after t = 0. */
  kDelayMs: number;
  ikLeakConst: number;
};

export const DEFAULT_APPROX_AP_PARAMS: ApproxApParams = {
  waveformDurationMs: 560,
  repeatPeriodMs: 2400,
  vRest: 0,
  vmAmp: 92,
  tauVmFast: 0.35,
  tauVmSlow: 3.2,
  tauNa: 0.55,
  ampNa: 95,
  tauK: 1.15,
  ampK: 42,
  kDelayMs: 0.85,
  ikLeakConst: 0.12,
};

/**
 * Phenomenological single-compartment AP: Na α-pulse, delayed K α-pulse, Vm from
 * difference-of-exponentials. `localPhaseMs` is position in the global phase timeline
 * minus conduction delay (ms); wrapped by repeatPeriodMs.
 */
export function evaluateApproximateAp(
  localPhaseMs: number,
  params: ApproxApParams = DEFAULT_APPROX_AP_PARAMS,
): TStepData {
  const t = positiveMod(localPhaseMs, params.repeatPeriodMs);
  if (t >= params.waveformDurationMs) {
    return {
      VM: params.vRest,
      INa: 0,
      IK: 0,
      IKleak: params.ikLeakConst,
    };
  }

  const span = Math.max(params.waveformDurationMs, 1e-6);
  const tShape = (t / span) * AP_SHAPE_REFERENCE_MS;

  const { vRest, vmAmp, tauVmFast, tauVmSlow } = params;
  const vmBump =
    Math.exp(-tShape / tauVmSlow) - Math.exp(-tShape / tauVmFast);
  const VM = MathUtils.clamp(vRest + vmAmp * vmBump, -120, 130);

  const INa = -params.ampNa * alphaKernel(tShape, params.tauNa);
  const IK = params.ampK * alphaKernel(tShape - params.kDelayMs, params.tauK);

  return {
    VM,
    INa,
    IK,
    IKleak: params.ikLeakConst,
  };
}
