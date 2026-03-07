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
  ILeak: number;
  INa_NaK_pump: number;
  IK_NaK_pump: number;
};

export class HHModel {
  private readonly VmResting: number = -70;
  private readonly ENa: number = 115;
  private readonly EK: number = -12;
  private readonly ELeak: number = 10.6;

  private readonly gmax_Na: number = 120;
  private readonly gmax_K: number = 36;
  private readonly gmax_Leak: number = 0.3;

  private readonly m: Gate = new Gate();
  private readonly h: Gate = new Gate();
  private readonly n: Gate = new Gate();

  private readonly Cm: number = 1;
  private Vm: number;

  constructor(initMembraneVoltageDelta: number) {
    this.Vm = initMembraneVoltageDelta;
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

  private g_K() {
    return Math.pow(this.n.state, 4) * this.gmax_K;
  }

  private I_K() {
    return this.g_K() * (this.Vm - this.EK);
  }

  private g_Na() {
    return Math.pow(this.m.state, 3) * this.h.state * this.gmax_Na;
  }

  private I_Na() {
    return this.g_Na() * (this.Vm - this.ENa);
  }

  private I_Leak() {
    return this.gmax_Leak * (this.Vm - this.ELeak);
  }

  private I_NaK_pump() {
    const membraneVoltage = this.Vm + this.VmResting;
    const max_pump_current = 10;
    const k_half = -60;
    return max_pump_current / (1 + Math.exp((membraneVoltage - k_half) / 10));
  }

  public step(tDeltaMs: number, stimulusCurrent = 0): TStepData {
    this._updateGateTimeConstants();
    const INa = this.I_Na();
    const IK = this.I_K();
    const ILeak = this.I_Leak();
    const ISum = stimulusCurrent - INa - IK - ILeak;
    const I_NaK_pump = this.I_NaK_pump();
    this.Vm += (tDeltaMs * ISum) / this.Cm;

    this.m.update(tDeltaMs);
    this.h.update(tDeltaMs);
    this.n.update(tDeltaMs);

    return {
      VM: this.Vm + this.VmResting,
      INa,
      IK,
      ILeak,
      INa_NaK_pump: I_NaK_pump * 3,
      IK_NaK_pump: -I_NaK_pump * 2,
    };
  }
}
