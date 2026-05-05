import { useLayoutEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

import {
  DEFAULT_APPROX_AP_PARAMS,
  evaluateApproximateAp,
  type ApproxApParams,
} from "./canonicalActionPotential";
import { type TStepData } from "./hhModel";

export type NeuronSimSampler = {
  readonly conductionMsPerWorldUnit: number;
  /** Not used for waveform sampling; kept for API compatibility. */
  readonly dtMs: number;
  readonly effluxLagMs: number;
  /** Global phase (ms) used by `sample` / `sampleEfflux`; matches GPU uniforms. */
  getPhaseMs(): number;
  /** Resolved AP parameters (defaults + options) for GPU parity with sampling. */
  getApproxParams(): ApproxApParams;
  sample(delayMs: number): TStepData;
  sampleEfflux(delayMs: number): TStepData;
  getSmoothedDrives(): {
    na: number;
    k: number;
    dVmDt: number;
    naSlow: number;
    kSlow: number;
    vmSlow: number;
    dVmSlow: number;
  };
};

/** Phase (ms) advanced per wall-clock ms (drives recurring AP rate). */
export const DEFAULT_PHASE_MS_PER_WALL_MS = 1.15;

const driveFromCurrent = (raw: number, k: number): number => {
  const v = Math.log(1 + k * Math.max(0, raw));
  return MathUtils.clamp(v / 4.2, 0, 1);
};

export function useNeuronWaveformSampler(options?: {
  conductionMsPerWorldUnit?: number;
  effluxLagMs?: number;
  phaseMsPerWallMs?: number;
  approxParams?: Partial<ApproxApParams>;
}): { samplerRef: RefObject<NeuronSimSampler | null> } {
  const optsRef = useRef(options);

  const paramsRef = useRef<ApproxApParams>({
    ...DEFAULT_APPROX_AP_PARAMS,
    ...options?.approxParams,
  });

  const phaseMsRef = useRef(0);
  const prevVmRef = useRef(DEFAULT_APPROX_AP_PARAMS.vRest);
  const smoothNaRef = useRef(0);
  const smoothKRef = useRef(0);
  const smoothDvRef = useRef(0);
  const visNaRef = useRef(0);
  const visKRef = useRef(0);
  const visVmRef = useRef(DEFAULT_APPROX_AP_PARAMS.vRest);
  const visDvRef = useRef(0);

  const samplerRef = useRef<NeuronSimSampler | null>(null);

  useLayoutEffect(() => {
    optsRef.current = options;
    const c = options?.conductionMsPerWorldUnit ?? 14;
    const e = options?.effluxLagMs ?? 2.8;
    samplerRef.current = {
      conductionMsPerWorldUnit: c,
      effluxLagMs: e,
      dtMs: 1,
      getPhaseMs: () => phaseMsRef.current,
      getApproxParams: () => paramsRef.current,
      sample: (delayMs: number) =>
        evaluateApproximateAp(
          phaseMsRef.current - delayMs,
          paramsRef.current,
        ),
      sampleEfflux: (delayMs: number) =>
        evaluateApproximateAp(
          phaseMsRef.current - delayMs - e,
          paramsRef.current,
        ),
      getSmoothedDrives: () => ({
        na: smoothNaRef.current,
        k: smoothKRef.current,
        dVmDt: smoothDvRef.current,
        naSlow: visNaRef.current,
        kSlow: visKRef.current,
        vmSlow: visVmRef.current,
        dVmSlow: visDvRef.current,
      }),
    };
  }, [options]);

  useFrame((_, delta) => {
    const o = optsRef.current;
    paramsRef.current = {
      ...DEFAULT_APPROX_AP_PARAMS,
      ...o?.approxParams,
    };

    const maxCatchUpMs = 80;
    const wallMs = Math.min(delta * 1000, maxCatchUpMs);
    const phaseMsPerWallMs =
      o?.phaseMsPerWallMs ?? DEFAULT_PHASE_MS_PER_WALL_MS;
    phaseMsRef.current += wallMs * phaseMsPerWallMs;

    const data = evaluateApproximateAp(
      phaseMsRef.current,
      paramsRef.current,
    );
    const dVm = (data.VM - prevVmRef.current) / Math.max(wallMs, 1e-6);
    prevVmRef.current = data.VM;

    const emaWall = 1 - Math.exp(-wallMs / 2.8);
    const naRaw = Math.max(0, -data.INa);
    const kRaw = Math.max(0, data.IK);
    smoothNaRef.current += emaWall * (
      driveFromCurrent(naRaw, 0.045) - smoothNaRef.current
    );
    smoothKRef.current += emaWall * (
      driveFromCurrent(kRaw, 0.08) - smoothKRef.current
    );
    smoothDvRef.current += emaWall * (
      MathUtils.clamp(Math.abs(dVm) / 12, 0, 1) - smoothDvRef.current
    );

    const dt = Math.min(delta, 0.12);
    const visA = 1 - Math.exp(-dt * 4.5);
    visVmRef.current += visA * (data.VM - visVmRef.current);
    visNaRef.current += visA * (smoothNaRef.current - visNaRef.current);
    visKRef.current += visA * (smoothKRef.current - visKRef.current);
    visDvRef.current += visA * (smoothDvRef.current - visDvRef.current);
  }, -1);

  return { samplerRef };
}
