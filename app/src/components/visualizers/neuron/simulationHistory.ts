import { MathUtils } from "three";

import { type TStepData } from "./hhModel";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const lerpTStep = (a: TStepData, b: TStepData, t: number): TStepData => ({
  VM: lerp(a.VM, b.VM, t),
  INa: lerp(a.INa, b.INa, t),
  IK: lerp(a.IK, b.IK, t),
  IKleak: lerp(a.IKleak, b.IKleak, t),
});

const ZERO: TStepData = { VM: 0, INa: 0, IK: 0, IKleak: 0 };

/**
 * Fixed-capacity ring of recent `TStepData` in chronological order.
 * `getRelative(0)` is the most recent sample; larger index is further in the past.
 */
export class StepHistory {
  private readonly cap: number;
  private readonly ring: TStepData[];
  private head = 0;
  private count = 0;

  constructor(capacity: number) {
    this.cap = Math.max(1, capacity);
    this.ring = Array.from({ length: this.cap }, () => ({ ...ZERO }));
  }

  public push(d: TStepData): void {
    this.ring[this.head] = {
      VM: d.VM,
      INa: d.INa,
      IK: d.IK,
      IKleak: d.IKleak,
    };
    this.head = (this.head + 1) % this.cap;
    this.count = Math.min(this.count + 1, this.cap);
  }

  public getRelative(stepsFromNewest: number): TStepData | undefined {
    if (this.count === 0 || stepsFromNewest < 0 || stepsFromNewest >= this.count) {
      return undefined;
    }
    const newestIdx = (this.head - 1 + this.cap) % this.cap;
    const idx =
      (((newestIdx - stepsFromNewest) % this.cap) + this.cap) % this.cap;
    return this.ring[idx];
  }

  /**
   * Linear interpolation in time: `delayMs` ago relative to the newest sample.
   * Requires `dtMs` to match the integration push cadence.
   */
  public sampleDelayMs(delayMs: number, dtMs: number): TStepData {
    if (this.count === 0) {
      return { ...ZERO };
    }
    const ageSteps = Math.max(0, delayMs) / Math.max(1e-9, dtMs);
    const maxIdx = this.count - 1;
    const clampedAge = Math.min(ageSteps, maxIdx);
    const i0 = Math.floor(clampedAge);
    const i1 = Math.min(i0 + 1, maxIdx);
    const frac = clampedAge - i0;
    const a = this.getRelative(i0);
    const b = this.getRelative(i1);
    if (!a) {
      return { ...ZERO };
    }
    if (!b) {
      return { ...a };
    }
    return lerpTStep(a, b, MathUtils.clamp(frac, 0, 1));
  }

  public newest(): TStepData {
    const s = this.getRelative(0);
    return s ? { ...s } : { ...ZERO };
  }
}
