export const _2PI = 2 * Math.PI;
export const NORM_QUADRANT_HYPOTENUSE_2D = Math.hypot(0.5, 0.5);
export const NORM_QUADRANT_HYPOTENUSE_3D = Math.hypot(0.5, 0.5, 0.5);

const cubeFaceCenterRadialOffset = (
  xNorm: number,
  yNorm: number,
  zNorm: number,
  interiorValue: number = 1.0
): number => {
  // calculate a radial offset for each face
  // (ie: treat each face as a grid and calculate radial dist from center of grid)
  // Exterior:
  if (xNorm == 0 || xNorm == 1) {
    return Math.hypot(yNorm - 0.5, zNorm - 0.5) / NORM_QUADRANT_HYPOTENUSE_2D;
  }
  if (yNorm == 0 || yNorm == 1) {
    return Math.hypot(xNorm - 0.5, xNorm - 0.5) / NORM_QUADRANT_HYPOTENUSE_2D;
  }
  if (zNorm == 0 || zNorm == 1) {
    return Math.hypot(xNorm - 0.5, yNorm - 0.5) / NORM_QUADRANT_HYPOTENUSE_2D;
  }
  // interior
  return interiorValue;
};

export enum EMappingSourceType {
  Data_1D,
  Waveform,
}

export enum ECoordinateType {
  Cartesian_1D,
  Cartesian_2D,
  Cartesian_3D,
  Cartesian_CubeFaces,
  Polar,
}

export interface ICoordinateMapper {
  amplitude: number;
  map: (
    inputCoordinateType: ECoordinateType,
    xNorm: number,
    yNorm?: number,
    zNorm?: number,
    elapsedTimeSec?: number
  ) => number;
}

abstract class CoordinateMapperBase implements ICoordinateMapper {
  public amplitude: number;

  constructor(amplitude: number = 1.0) {
    this.amplitude = amplitude;
  }

  public map(
    inputCoordinateType: ECoordinateType,
    xNorm: number,
    yNorm: number = 0.0,
    zNorm: number = 0.0,
    elapsedTimeSec: number = 0.0
  ) {
    switch (inputCoordinateType) {
      case ECoordinateType.Cartesian_1D:
        return this.map_1D(xNorm, elapsedTimeSec);
      case ECoordinateType.Cartesian_2D:
      case ECoordinateType.Polar:
        return this.map_2D(xNorm, yNorm, elapsedTimeSec);
      case ECoordinateType.Cartesian_3D:
        return this.map_3D(xNorm, yNorm, zNorm, elapsedTimeSec);
      case ECoordinateType.Cartesian_CubeFaces:
        return this.map_3DFaces(xNorm, yNorm, zNorm, elapsedTimeSec);
      default:
        throw Error(`Unsupported coordinate type: ${inputCoordinateType}`);
    }
  }

  abstract map_1D(xNorm: number, elapsedTimeSec: number): number;
  abstract map_2D(xNorm: number, yNorm: number, elapsedTimeSec: number): number;
  abstract map_3D(
    xNorm: number,
    yNorm: number,
    zNorm: number,
    elapsedTimeSec: number
  ): number;
  abstract map_3DFaces(
    xNorm: number,
    yNorm: number,
    zNorm: number,
    elapsedTimeSec: number
  ): number;
}

export class CoordinateMapper_Waveform extends CoordinateMapperBase {
  public readonly frequencyHz: number;
  protected periodSec: number;
  protected b: number;
  constructor(amplitude: number = 1.0, frequencyHz: number) {
    super(amplitude);
    this.frequencyHz = frequencyHz;
    this.periodSec = 1 / frequencyHz;
    this.b = _2PI / this.periodSec;
  }

  public map_1D(xNorm: number, elapsedTimeSec: number = 0.0) {
    return this.amplitude * Math.sin(this.b * xNorm + elapsedTimeSec);
  }

  public map_2D(xNorm: number, yNorm: number, elapsedTimeSec: number = 0.0) {
    const normRadialOffset =
      Math.hypot(xNorm - 0.5, yNorm - 0.5) / NORM_QUADRANT_HYPOTENUSE_2D;
    return (
      this.amplitude * Math.sin(this.b * normRadialOffset + elapsedTimeSec)
    );
  }

  public map_3D(
    xNorm: number,
    yNorm: number,
    zNorm: number,
    elapsedTimeSec: number = 0.0
  ) {
    const normRadialOffset =
      Math.hypot(xNorm - 0.5, yNorm - 0.5, zNorm - 0.5) /
      NORM_QUADRANT_HYPOTENUSE_3D;
    return (
      this.amplitude * Math.sin(this.b * normRadialOffset + elapsedTimeSec)
    );
  }

  public map_3DFaces(
    xNorm: number,
    yNorm: number,
    zNorm: number,
    elapsedTimeSec: number = 0.0
  ) {
    const normRadialOffset = cubeFaceCenterRadialOffset(
      xNorm,
      yNorm,
      zNorm,
      1.0
    );
    return (
      this.amplitude * Math.sin(this.b * normRadialOffset + elapsedTimeSec)
    );
  }
}

export class CoordinateMapper_Data extends CoordinateMapperBase {
  public data: number[];

  constructor(amplitude: number = 1.0, data: number[]) {
    super(amplitude);
    this.data = data;
  }

  private interpolateValueForNormalizedCoord(normalizedCoord: number) {
    if (this.data === undefined || !this.data || this.data.length === 0) {
      return 0;
    }
    // Interpolate from the bar values based on the normalized Coord
    let rawIdx = normalizedCoord * (this.data.length - 1);
    let valueBelow = this.data[Math.floor(rawIdx)];
    let valueAbove = this.data[Math.ceil(rawIdx)];
    return valueBelow + (rawIdx % 1) * (valueAbove - valueBelow);
  }

  public map_1D(xNorm: number, elapsedTimeSec: number = 0.0) {
    return this.amplitude * this.interpolateValueForNormalizedCoord(xNorm);
  }

  public map_2D(xNorm: number, yNorm: number, elapsedTimeSec: number = 0.0) {
    const normRadialOffset =
      Math.hypot(xNorm - 0.5, yNorm - 0.5) / NORM_QUADRANT_HYPOTENUSE_2D;
    return (
      this.amplitude * this.interpolateValueForNormalizedCoord(normRadialOffset)
    );
  }

  public map_3D(
    xNorm: number,
    yNorm: number,
    zNorm: number,
    elapsedTimeSec: number = 0.0
  ) {
    const normRadialOffset =
      Math.hypot(xNorm - 0.5, yNorm - 0.5, zNorm - 0.5) /
      NORM_QUADRANT_HYPOTENUSE_3D;
    return (
      this.amplitude * this.interpolateValueForNormalizedCoord(normRadialOffset)
    );
  }

  public map_3DFaces(
    xNorm: number,
    yNorm: number,
    zNorm: number,
    elapsedTimeSec: number = 0.0
  ) {
    const normRadialOffset = cubeFaceCenterRadialOffset(
      xNorm,
      yNorm,
      zNorm,
      1.0
    );
    return (
      this.amplitude * this.interpolateValueForNormalizedCoord(normRadialOffset)
    );
  }
}

export class CoordinateMapper_WaveformSuperposition
  implements ICoordinateMapper
{
  private mappers: CoordinateMapper_Waveform[];
  private _amplitudeSplitRatio: number;
  get amplitudeSplitRatio(): number {
    return this._amplitudeSplitRatio;
  }
  set amplitudeSplitRatio(value: number) {
    this._amplitudeSplitRatio = value;
    this.mappers = this.buildMappers(
      this.waveFrequenciesHz,
      this._maxAmplitude,
      this._amplitudeSplitRatio
    );
  }
  private _maxAmplitude: number;
  get amplitude(): number {
    return this._maxAmplitude;
  }
  set amplitude(value: number) {
    this._maxAmplitude = value;
    this.mappers = this.buildMappers(
      this.waveFrequenciesHz,
      this._maxAmplitude,
      this._amplitudeSplitRatio
    );
  }

  get waveFrequenciesHz(): number[] {
    return this.mappers.map((m) => m.frequencyHz);
  }
  set waveFrequenciesHz(waveFrequenciesHz: number[]) {
    this.mappers = this.buildMappers(
      waveFrequenciesHz,
      this._maxAmplitude,
      this._amplitudeSplitRatio
    );
  }

  constructor(
    waveformFrequenciesHz: number[],
    maxAmplitude: number = 1.0,
    amplitudeSplitRatio: number = 0.75
  ) {
    this._maxAmplitude = maxAmplitude;
    this._amplitudeSplitRatio = amplitudeSplitRatio;
    this.mappers = this.buildMappers(
      waveformFrequenciesHz,
      maxAmplitude,
      amplitudeSplitRatio
    );
  }

  private buildMappers(
    waveformFrequenciesHz: number[],
    maxAmplitude: number,
    amplitudeSplitRatio: number
  ): CoordinateMapper_Waveform[] {
    const mappers = [];
    for (let i = 0; i < waveformFrequenciesHz.length; i++) {
      // Split the total amplitude among the various waves
      const amplitude =
        i >= waveformFrequenciesHz.length - 1
          ? maxAmplitude
          : amplitudeSplitRatio * maxAmplitude;
      maxAmplitude -= amplitude;

      mappers.push(
        new CoordinateMapper_Waveform(amplitude, waveformFrequenciesHz[i])
      );
    }
    return mappers;
  }

  public map(
    inputCoordinateType: ECoordinateType,
    xNorm: number,
    yNorm: number = 0.0,
    zNorm: number = 0.0,
    elapsedTimeSec: number = 0.0
  ) {
    let superposition = 0;
    for (const mapper of this.mappers) {
      superposition += mapper.map(
        inputCoordinateType,
        xNorm,
        yNorm,
        zNorm,
        elapsedTimeSec
      );
    }
    return superposition;
  }
}
