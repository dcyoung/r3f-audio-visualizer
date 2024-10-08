import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";

export class EnergyTracker implements IScalarTracker {
  private _energyInfo: number;

  constructor(energyInfo: number) {
    this._energyInfo = energyInfo;
  }

  public set(value: number): void {
    this._energyInfo = value;
  }

  public get(): number {
    return this._energyInfo;
  }
}
