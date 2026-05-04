import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

import { HHModel, type TStepData } from "./hhModel";
import { StepHistory } from "./simulationHistory";

export type NeuronSimSampler = {
  /** Milliseconds per unit of arclength along the axon (soma → distal). */
  readonly conductionMsPerWorldUnit: number;
  /** Simulation time represented by one stored sample (sub-step size). */
  readonly dtMs: number;
  /** Extra delay (ms) for efflux sampling vs influx at the same arclength. */
  readonly effluxLagMs: number;
  sample(delayMs: number): TStepData;
  sampleEfflux(delayMs: number): TStepData;
  /** Smoothed 0–1 drives for current-modulated particle rate (plan §3b). */
  getSmoothedDrives(): {
    na: number;
    k: number;
    dVmDt: number;
    /** Slower EMAs (~200 ms) for axial band / spin — cuts frame-to-frame flicker. */
    naSlow: number;
    kSlow: number;
    vmSlow: number;
    dVmSlow: number;
  };
};

/** Explicit HH needs small dt; 0.1 ms blows up to Infinity with stimulus ≈22. */
const SUBSTEP_MS = 0.05;
/** Enough sim-history for long axial delays at `conductionMsPerWorldUnit` (ms delay / world unit). */
const HISTORY_CAPACITY = 20_000;
/** Simulated HH time (ms) per wall-clock ms. <1 stretches AP and propagation for visuals. */
export const DEFAULT_SIM_TIME_SCALE = 0.002;

/** `saturate(log(1 + k * x))` with clamp for stable visuals. */
const driveFromCurrent = (raw: number, k: number): number => {
  const v = Math.log(1 + k * Math.max(0, raw));
  return MathUtils.clamp(v / 4.2, 0, 1);
};

export function useNeuronSimulation(options?: {
  conductionMsPerWorldUnit?: number;
  effluxLagMs?: number;
  stimulusKeyHold?: boolean;
  /** Sim ms advanced per real ms (default ~500× slower than real time). */
  simTimeScale?: number;
}): { samplerRef: RefObject<NeuronSimSampler | null> } {
  const conductionMsPerWorldUnit =
    options?.conductionMsPerWorldUnit ?? 14;
  const effluxLagMs = options?.effluxLagMs ?? 2.8;
  const simTimeScale = options?.simTimeScale ?? DEFAULT_SIM_TIME_SCALE;

  const modelRef = useRef<HHModel | null>(null);
  const historyRef = useRef<StepHistory | null>(null);
  const simAccumRef = useRef(0);
  const stimulusRef = useRef(0);
  const prevVmRef = useRef(0);
  const smoothNaRef = useRef(0);
  const smoothKRef = useRef(0);
  const smoothDvRef = useRef(0);
  const visNaRef = useRef(0);
  const visKRef = useRef(0);
  const visVmRef = useRef(0);
  const visDvRef = useRef(0);

  const samplerRef = useRef<NeuronSimSampler | null>(null);

  useLayoutEffect(() => {
    const empty: TStepData = { VM: 0, INa: 0, IK: 0, IKleak: 0 };
    samplerRef.current = {
      conductionMsPerWorldUnit,
      effluxLagMs,
      dtMs: SUBSTEP_MS,
      sample: (delayMs: number) =>
        historyRef.current?.sampleDelayMs(delayMs, SUBSTEP_MS) ?? { ...empty },
      sampleEfflux: (delayMs: number) =>
        historyRef.current?.sampleDelayMs(
          delayMs + effluxLagMs,
          SUBSTEP_MS,
        ) ?? { ...empty },
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
  }, [conductionMsPerWorldUnit, effluxLagMs]);

  useEffect(() => {
    const model = new HHModel(0);
    const history = new StepHistory(HISTORY_CAPACITY);
    modelRef.current = model;
    historyRef.current = history;
    prevVmRef.current = 0;
    visVmRef.current = 0;
    visNaRef.current = 0;
    visKRef.current = 0;
    visDvRef.current = 0;
    for (let s = 0; s < 24_000; s += 1) {
      history.push(model.step(SUBSTEP_MS, 0));
    }
    const last = history.newest();
    if (last) {
      prevVmRef.current = last.VM;
      visVmRef.current = last.VM;
    }
  }, []);

  useEffect(() => {
    if (!options?.stimulusKeyHold) {
      return;
    }
    const controller = new AbortController();
    const onDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      stimulusRef.current = 22;
    };
    const onUp = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      stimulusRef.current = 0;
    };
    window.addEventListener("keydown", onDown, {
      capture: true,
      signal: controller.signal,
    });
    window.addEventListener("keyup", onUp, {
      capture: true,
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [options?.stimulusKeyHold]);

  useFrame(
    (_, delta) => {
      const model = modelRef.current;
      const history = historyRef.current;
      if (!model || !history) {
        return;
      }

      const maxCatchUpMs = 80;
      simAccumRef.current +=
        Math.min(delta * 1000, maxCatchUpMs) * simTimeScale;

      // Fixed SUBSTEP_MS pushes only so `sampleDelayMs(..., SUBSTEP_MS)` stays aligned.
      while (simAccumRef.current >= SUBSTEP_MS - 1e-9) {
        simAccumRef.current -= SUBSTEP_MS;
        const data = model.step(SUBSTEP_MS, stimulusRef.current);
        history.push(data);

        const dVm = (data.VM - prevVmRef.current) / SUBSTEP_MS;
        prevVmRef.current = data.VM;

        const naRaw = Math.max(0, -data.INa);
        const kRaw = Math.max(0, data.IK);
        const ema = 1 - Math.exp(-SUBSTEP_MS / 0.35);
        smoothNaRef.current += ema * (
          driveFromCurrent(naRaw, 0.045) - smoothNaRef.current
        );
        smoothKRef.current += ema * (
          driveFromCurrent(kRaw, 0.08) - smoothKRef.current
        );
        smoothDvRef.current += ema * (
          MathUtils.clamp(Math.abs(dVm) / 12, 0, 1) - smoothDvRef.current
        );
      }

      const dt = Math.min(delta, 0.12);
      const visA = 1 - Math.exp(-dt * 4.5);
      visVmRef.current += visA * (prevVmRef.current - visVmRef.current);
      visNaRef.current += visA * (smoothNaRef.current - visNaRef.current);
      visKRef.current += visA * (smoothKRef.current - visKRef.current);
      visDvRef.current += visA * (smoothDvRef.current - visDvRef.current);
    },
    -1,
  );

  return { samplerRef };
}
