class Gate {
  /* Manages a channel's kinetics and open state */
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
    this._state += deltaTimeMs * (alphaState - betaState);
  }

  public setInfiniteState(): void {
    this._state = this.alpha / (this.alpha + this.beta);
  }
}

export type TStepData = {
  VM: number;
  INa: number;
  IK: number;
  IKleak: number;
};
export class HHModel {
  /* Hodgkin-Huxley model */
  // Equilibrium potential for each ionic channel
  private readonly ENa: number = 115;
  private readonly EK: number = -12;
  private readonly EKleak: number = 10.6;
  // conductance for each ionic channel
  private readonly gNa: number = 120;
  private readonly gK: number = 36;
  private readonly gKleak: number = 0.3;

  // ionic channels
  private readonly m: Gate = new Gate();
  private readonly h: Gate = new Gate();
  private readonly n: Gate = new Gate();

  private readonly Cm: number = 1;

  private Vm: number;

  constructor(initMembraneVoltage: number) {
    this.Vm = initMembraneVoltage;
    this._updateGateTimeConstants();
    this.m.setInfiniteState();
    this.h.setInfiniteState();
    this.n.setInfiniteState();
  }

  private _updateGateTimeConstants() {
    // Update gate time constants based on the given Vm
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
    // Update gate time constants based on the given Vm
    this._updateGateTimeConstants();
    // calculate channel currents using the latest gate time constants
    const INa =
      Math.pow(this.m.state, 3) *
      this.gNa *
      this.h.state *
      (this.Vm - this.ENa);
    const IK = Math.pow(this.n.state, 4) * this.gK * (this.Vm - this.EK);
    const IKleak = this.gKleak * (this.Vm - this.EKleak);
    const Isum = stimulusCurrent - INa - IK - IKleak;
    this.Vm += (tDeltaMs * Isum) / this.Cm;

    // calculate new channel open states using latest Vm
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
