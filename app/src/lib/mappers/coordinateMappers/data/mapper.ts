import {
  CoordinateMapperBase,
  cubeFaceCenterRadialOffset,
  HALF_DIAGONAL_UNIT_CUBE,
  HALF_DIAGONAL_UNIT_SQUARE,
} from "@/lib/mappers/coordinateMappers/common";

export type TCoordinateMapper_DataParams = {
  amplitude: number;
  size: number;
};
/**
 * Maps input coordinates to output values based on pre-existing 1D data.
 * Supports interpolation and anti-aliasing.
 */
export class CoordinateMapper_Data extends CoordinateMapperBase {
  public static get PRESETS() {
    return {
      DEFAULT: {
        amplitude: 1.0,
        size: 121,
      },
    };
  }
  public clone(params: Partial<TCoordinateMapper_DataParams>) {
    return new CoordinateMapper_Data({
      ...this._params,
      ...params,
    });
  }
  private _params: TCoordinateMapper_DataParams;
  public get params(): TCoordinateMapper_DataParams {
    return this._params;
  }
  public data: Float32Array;

  /**
   *
   * @param amplitude - the maximum amplitude of the scaled output.
   * @param data - the size of 1D data from which to interpolate values.
   */
  constructor(
    params: TCoordinateMapper_DataParams = CoordinateMapper_Data.PRESETS
      .DEFAULT,
  ) {
    super(params.amplitude);
    this._params = params;
    this.data = new Float32Array(params.size).fill(0);
  }

  private interpolateValueForNormalizedCoord(normalizedCoord: number): number {
    if (this.data === undefined || !this.data || this.data.length === 0) {
      return 0;
    }
    // Interpolate from the bar values based on the normalized Coord
    const rawIdx = normalizedCoord * (this.data.length - 1);
    const valueBelow = this.data[Math.floor(rawIdx)];
    const valueAbove = this.data[Math.ceil(rawIdx)];
    return valueBelow + (rawIdx % 1) * (valueAbove - valueBelow);
  }

  public map_1D(xNorm: number, _ = 0.0): number {
    return this.amplitude * this.interpolateValueForNormalizedCoord(xNorm);
  }

  public map_2D(xNorm: number, yNorm: number, elapsedTimeSec = 0.0): number {
    const normRadialOffset =
      Math.hypot(xNorm - 0.5, yNorm - 0.5) / HALF_DIAGONAL_UNIT_SQUARE;
    return this.map_1D(normRadialOffset, elapsedTimeSec);
  }

  public map_3D(
    xNorm: number,
    yNorm: number,
    zNorm: number,
    elapsedTimeSec = 0.0,
  ): number {
    const normRadialOffset =
      Math.hypot(xNorm - 0.5, yNorm - 0.5, zNorm - 0.5) /
      HALF_DIAGONAL_UNIT_CUBE;
    return this.map_1D(normRadialOffset, elapsedTimeSec);
  }

  public map_3DFaces(
    xNorm: number,
    yNorm: number,
    zNorm: number,
    elapsedTimeSec = 0.0,
  ): number {
    const normRadialOffset = cubeFaceCenterRadialOffset(
      xNorm,
      yNorm,
      zNorm,
      1.0,
    );
    return this.map_1D(normRadialOffset, elapsedTimeSec);
  }
}
