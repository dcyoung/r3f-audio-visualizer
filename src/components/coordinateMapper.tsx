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
  map: (
    xNorm: number,
    yNorm?: number,
    zNorm?: number,
    elapsedTimeSec?: number
  ) => number;
}

abstract class CoordinateMapperBase implements ICoordinateMapper {
  protected srcType: ECoordinateType;
  protected amplitude: number;

  constructor(srcType: ECoordinateType, amplitude: number = 1.0) {
    this.srcType = srcType;
    this.amplitude = amplitude;
  }

  public map(
    xNorm: number,
    yNorm: number = 0.0,
    zNorm: number = 0.0,
    elapsedTimeSec: number = 0.0
  ) {
    switch (this.srcType) {
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
        throw Error(`Unsupported coordinate type: ${this.srcType}`);
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
  protected periodSec: number;
  protected b: number;
  constructor(
    srcType: ECoordinateType,
    amplitude: number = 1.0,
    frequencyHz: number
  ) {
    super(srcType, amplitude);
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
  protected data: number[];

  constructor(
    srcType: ECoordinateType,
    amplitude: number = 1.0,
    data: number[]
  ) {
    super(srcType, amplitude);
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

  // take 3/4 of remainder + remaining if no next...
  constructor(
    srcType: ECoordinateType,
    waveformFrequenciesHz: number[],
    maxAmplitude: number = 1.0,
    amplitudeSplitRatio: number = 0.75
  ) {
    const mappers = [];
    for (let i = 0; i < waveformFrequenciesHz.length; i++) {
      const amplitude =
        i >= waveformFrequenciesHz.length - 1
          ? maxAmplitude
          : amplitudeSplitRatio * maxAmplitude;
      maxAmplitude -= amplitude;

      mappers.push(
        new CoordinateMapper_Waveform(
          srcType,
          amplitude,
          waveformFrequenciesHz[i]
        )
      );
    }
    this.mappers = mappers;
  }

  public map(
    xNorm: number,
    yNorm: number = 0.0,
    zNorm: number = 0.0,
    elapsedTimeSec: number = 0.0
  ) {
    let superposition = 0;
    for (const mapper of this.mappers) {
      superposition += mapper.map(xNorm, yNorm, zNorm, elapsedTimeSec);
    }
    return superposition;
  }
}

export interface CoordinateMapper_Multi_Args {
  mappingType?: EMappingSourceType;
  inputCoordinateType?: ECoordinateType;
  amplitude?: number;
  waveFrequenciesHz?: number[];
  data?: number[];
}

export class CoordinateMapper_Multi implements ICoordinateMapper {
  public mappingType: EMappingSourceType;

  private _mapper: ICoordinateMapper;

  private _inputCoordinateType: ECoordinateType = ECoordinateType.Cartesian_2D;
  set inputCoordinateType(value: ECoordinateType) {
    this._inputCoordinateType = value;
    this.updateMapper();
  }

  private _waveFrequenciesHz: number[] = [2.0];
  get waveFrequenciesHz(): number[] {
    return this._waveFrequenciesHz;
  }
  set waveFrequenciesHz(value: number[]) {
    if (!value || value.length < 1) {
      throw new Error("Invalid value");
    }
    this._waveFrequenciesHz = value;
    this.updateMapper();
  }

  private _amplitude: number = 1.0;
  get amplitude(): number {
    return this._amplitude;
  }
  set amplitude(value: number) {
    this._amplitude = value;
    this.updateMapper();
  }

  private _data: number[] = [];
  get data(): number[] {
    return this._data;
  }
  set data(value: number[]) {
    this._data = value;
    this.updateMapper();
  }

  constructor({
    mappingType = EMappingSourceType.Waveform,
    inputCoordinateType = ECoordinateType.Cartesian_2D,
    amplitude = 1.0,
    waveFrequenciesHz = [2.0],
    data = [],
  }: CoordinateMapper_Multi_Args) {
    this.mappingType = mappingType;
    this._inputCoordinateType = inputCoordinateType;
    this._amplitude = amplitude;
    if (!waveFrequenciesHz || waveFrequenciesHz.length < 1) {
      throw new Error("Invalid value");
    }
    this._waveFrequenciesHz = waveFrequenciesHz;
    this._data = data;
    this._mapper = this.updateMapper();
  }

  private updateMapper(): ICoordinateMapper {
    switch (this.mappingType) {
      case EMappingSourceType.Waveform:
        this._mapper =
          this.waveFrequenciesHz.length == 1
            ? new CoordinateMapper_Waveform(
                this._inputCoordinateType,
                this.amplitude,
                this.waveFrequenciesHz[0]
              )
            : new CoordinateMapper_WaveformSuperposition(
                this._inputCoordinateType,
                this.waveFrequenciesHz,
                this.amplitude
              );
        return this._mapper;
      case EMappingSourceType.Data_1D:
        this._mapper = new CoordinateMapper_Data(
          this._inputCoordinateType,
          this.amplitude,
          this.data
        );
        return this._mapper;
      default:
        throw `Not supported: ${this.mappingType}`;
    }
  }

  public map(
    xNorm: number,
    yNorm: number = 0.0,
    zNorm: number = 0.0,
    elapsedTimeSec: number = 0.0
  ) {
    return this._mapper.map(xNorm, yNorm, zNorm, elapsedTimeSec);
  }
}
