
// represent gating variables that describe the probability 
// of a voltage-gated ion channel being open at a given time
class Gate {
  /* Manages a channel's kinetics and open state */
  private alpha = 0;
  private beta = 0;
  // can range from 0 (completely closed channel) to 1 (fully open channel)
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
  // Membrane voltage, in mV
  VM: number;
  // Voltage gated sodium channel current (in uA/cm^2)
  INa: number;
  // Voltage gated potassium channel current (in uA/cm^2)
  IK: number;
  // Leak is a small, constant current that flows across the neuronal membrane, 
  // representing the passive movement of ions through channels that are not voltage-gated
  // (in uA/cm^2)
  ILeak: number;
  // Sodium current from Sodium-potassium pump (in uA/cm^2) 
  INa_NaK_pump: number;
  // Potassium current from Sodium-potassium pump (in uA/cm^2) 
  IK_NaK_pump: number;
};
/* Hodgkin-Huxley model */
export class HHModel {
  // Resting membrane potential, in mV
  private readonly VmResting: number = -70;
  // Sodium (Na) equilibrium potential, in mV
  private readonly ENa: number = 115;
  // Potassium (K) equilibrium potential, in mV
  private readonly EK: number = -12;
  // Leak equilibrium potential, in mV 
  private readonly ELeak: number = 10.6;

  // Sodium (Na) maximum conductances, in mS/cm^2 
  private readonly gmax_Na: number = 120;
  // Postassium (K) maximum conductances, in mS/cm^2
  private readonly gmax_K: number = 36;
  // Leak maximum conductances, in mS/cm^2
  private readonly gmax_Leak: number = 0.3;

  // ionic channels - describe the probability of a voltage-gated ion channel being open at a given time
  // "m" represents sodium channel activation 
  private readonly m: Gate = new Gate();
  // "h" representing sodium channel inactivation
  private readonly h: Gate = new Gate();
  // "n" representing potassium channel activation
  private readonly n: Gate = new Gate();

  // membrane capacitance, in uF/cm^2
  private readonly Cm: number = 1;

  // Curent delta in membrane voltage (from resting) (in mV)
  private Vm: number;

  constructor(initMembraneVoltageDelta: number) {
    this.Vm = initMembraneVoltageDelta;
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

  // Potassium Conductance density (in mS/cm^2) 
  private g_K() {
    return Math.pow(this.n.state, 4) * this.gmax_K;
  }

  // Potassium Current (in uA/cm^2) from voltage gated potassium channels
  private I_K() {
    return this.g_K() * (this.Vm - this.EK);
  }

  // Sodium Conductance density (in mS/cm^2)
  private g_Na() {
    return Math.pow(this.m.state, 3) * this.h.state * this.gmax_Na;
  }

  // Sodium Current (in uA/cm^2) from voltage gated sodium channels
  private I_Na() {
    return this.g_Na() * (this.Vm - this.ENa);
  }

  // Leak/Passive Membrane Current (in uA/cm^2)
  private I_Leak() {
    return this.gmax_Leak * (this.Vm - this.ELeak);
  }

  // Na+/K+ current from Na+/K+ pump (in uA/cm^2)
  // Uses a simplified voltage and concentration dependent model of Na+/K+ pump.
  private I_NaK_pump() {
    const membraneVoltage = this.Vm + this.VmResting;
    // Simplified Michaelis-Menten like function.
    const max_pump_current = 10 // adjust value - (uA / cm2)
    // the membrane voltage at which the sodium-potassium pump's activity is half-maximal. 
    // In other words, it's the voltage at which the pump is operating at 50% of its maximum rate
    const k_half = -60 // adjust value
    return max_pump_current / (1 + Math.exp((membraneVoltage - k_half) / 10))
  }

  public step(tDeltaMs: number, stimulusCurrent = 0): TStepData {
    // Update gate time constants based on the given Vm
    this._updateGateTimeConstants();
    // calculate channel currents using the latest gate time constants
    const INa = this.I_Na();
    const IK = this.I_K();
    const ILeak = this.I_Leak();
    const ISum = stimulusCurrent - INa - IK - ILeak;
    const I_NaK_pump = this.I_NaK_pump();
    this.Vm += (tDeltaMs * ISum) / this.Cm;

    // calculate new channel open states using latest Vm
    this.m.update(tDeltaMs);
    this.h.update(tDeltaMs);
    this.n.update(tDeltaMs);

    return {
      VM: this.Vm + this.VmResting,
      INa,
      IK,
      ILeak,
      INa_NaK_pump: I_NaK_pump * 3, // 3 Na+ out
      IK_NaK_pump: -I_NaK_pump * 2, // 2 K+ in
    };
  }
}
