import { MathUtils } from "three";

/**
 * Hodgkin–Huxley lumped compartment (squid axon–style parameters from the
 * feature/neuron-webgpu branch). Currents follow the usual HH convention:
 * `Isum = I_stimulus - I_Na - I_K - I_leak` with `I_Na = g_Na m^3 h (V - E_Na)`.
 *
 * **Signs (for visuals):** `I_Na` is typically negative during the upstroke
 * (inward Na⁺ flow of positive charge). Use **`-I_Na`** when you want a
 * nonnegative “Na influx drive”. `I_K` is often positive during repolarization
 * (outward K⁺); use **`max(0, I_K)`** as “K efflux drive” for particle art.
 */
export type TStepData = {
  VM: number;
  INa: number;
  IK: number;
  IKleak: number;
};

/** Nonnegative visual drive for Na⁺ influx from signed `I_Na` (see file header). */
export function naInfluxDrive(INa: number): number {
  return MathUtils.clamp(Math.log(1 + 0.045 * Math.max(0, -INa)) / 4.2, 0, 1);
}

/** Nonnegative visual drive for K⁺ efflux from signed `I_K`. */
export function kEffluxDrive(IK: number): number {
  return MathUtils.clamp(Math.log(1 + 0.08 * Math.max(0, IK)) / 4.2, 0, 1);
}

class Gate {
  private alpha = 0;
  private beta = 0;
  private _state = 0;
  public get state() {
    return this._state;
  }

  public setTimeConstants(alpha: number, beta: number): void {
    this.alpha = alpha;
    this.beta = beta;
  }

  public update(deltaTimeMs: number): void {
    const alphaState = this.alpha * (1 - this.state);
    const betaState = this.beta * this.state;
    const next = this._state + deltaTimeMs * (alphaState - betaState);
    this._state = Number.isFinite(next)
      ? MathUtils.clamp(next, 0, 1)
      : this._state;
  }

  public setInfiniteState(): void {
    this._state = this.alpha / (this.alpha + this.beta);
  }
}

export class HHModel {
  private readonly ENa = 115;
  private readonly EK = -12;
  private readonly EKleak = 10.6;

  private readonly gNa = 120;
  private readonly gK = 36;
  private readonly gKleak = 0.3;

  private readonly m = new Gate();
  private readonly h = new Gate();
  private readonly n = new Gate();

  private readonly Cm = 1;

  private Vm: number;

  constructor(initMembraneVoltage: number) {
    this.Vm = initMembraneVoltage;
    this._updateGateTimeConstants();
    this.m.setInfiniteState();
    this.h.setInfiniteState();
    this.n.setInfiniteState();
  }

  private _updateGateTimeConstants() {
    this.n.setTimeConstants(
      0.01 * ((10 - this.Vm) / (Math.exp((10 - this.Vm) / 10) - 1)),
      0.125 * Math.exp(-this.Vm / 80),
    );
    this.m.setTimeConstants(
      0.1 * ((25 - this.Vm) / (Math.exp((25 - this.Vm) / 10) - 1)),
      4 * Math.exp(-this.Vm / 18),
    );
    this.h.setTimeConstants(
      0.07 * Math.exp(-this.Vm / 20),
      1 / (Math.exp((30 - this.Vm) / 10) + 1),
    );
  }

  public step(tDeltaMs: number, stimulusCurrent = 0): TStepData {
    this._updateGateTimeConstants();
    const INa =
      Math.pow(this.m.state, 3) *
      this.gNa *
      this.h.state *
      (this.Vm - this.ENa);
    const IK = Math.pow(this.n.state, 4) * this.gK * (this.Vm - this.EK);
    const IKleak = this.gKleak * (this.Vm - this.EKleak);
    const Isum = stimulusCurrent - INa - IK - IKleak;
    this.Vm += (tDeltaMs * Isum) / this.Cm;
    this.Vm = Number.isFinite(this.Vm)
      ? MathUtils.clamp(this.Vm, -120, 130)
      : 0;

    this.m.update(tDeltaMs);
    this.h.update(tDeltaMs);
    this.n.update(tDeltaMs);

    return {
      VM: this.Vm,
      INa,
      IK,
      IKleak,
    };
  }
}
