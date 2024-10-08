import { type ICoordinateMapper } from "./common";

export class CoordinateMapper_Proxy implements ICoordinateMapper {
  private _internal: ICoordinateMapper;
  public get amplitude(): number {
    return this._internal.amplitude;
  }
  constructor(other: ICoordinateMapper) {
    this._internal = other;
  }

  public set(other: ICoordinateMapper): void {
    this._internal = other;
  }

  public map(...params: Parameters<ICoordinateMapper["map"]>) {
    return this._internal.map(...params);
  }
}
