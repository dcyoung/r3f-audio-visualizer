export const _2PI = 2 * Math.PI;
/**
 * "Hypotenuse" for the quadrant of a unit square.
 */
export const HALF_DIAGONAL_UNIT_SQUARE = Math.hypot(0.5, 0.5);
/**
 * "Hypotenuse" for the quadrant of a unit cube.
 */
export const HALF_DIAGONAL_UNIT_CUBE = Math.hypot(0.5, 0.5, 0.5);

/**
 * For a point in 3D space, calculate the radial offset value from the center of the nearest face of a unit cube.
 * @param xNorm - The normalized x coordinate in 3D space. Range [0,1] inclusive.
 * @param yNorm - The normalized y coordinate in 3D space. Range [0,1] inclusive.
 * @param zNorm - The normalized z coordinate in 3D space. Range [0,1] inclusive.
 * @param interiorValue - The value to return for any interior coordinates which do NOT reside on the faces of a unit cube.
 * @returns - the radial offset value.
 */
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
    return Math.hypot(yNorm - 0.5, zNorm - 0.5) / HALF_DIAGONAL_UNIT_SQUARE;
  }
  if (yNorm == 0 || yNorm == 1) {
    return Math.hypot(xNorm - 0.5, xNorm - 0.5) / HALF_DIAGONAL_UNIT_SQUARE;
  }
  if (zNorm == 0 || zNorm == 1) {
    return Math.hypot(xNorm - 0.5, yNorm - 0.5) / HALF_DIAGONAL_UNIT_SQUARE;
  }
  // interior
  return interiorValue;
};

/**
 * Describes a coordinate type.
 */
export enum ECoordinateType {
  Cartesian_1D,
  Cartesian_2D,
  Cartesian_3D,
  Cartesian_CubeFaces,
  Polar,
}

/**
 * Maps normalized input coordinates to scalar output values.
 */
export interface ICoordinateMapper {
  /**
   * The max amplitude of the scaled output values.
   */
  amplitude: number;

  /**
   * Maps a normalized input coordinate to a scalar value.
   * @param inputCoordinateType - The type of input coordinate.
   * @param xNorm - A normalized value representing the 1st dimension of the input coordinate. Range [0,1] inclusive.
   * @param yNorm - A normalized value representing the 2nd dimension of the input coordinate. Range [0,1] inclusive. Ignored if NOT applicable.
   * @param zNorm - A normalized value representing the 3rd dimension of the input coordinate. Range [0,1] inclusive. Ignored if NOT applicable.
   * @param elapsedTimeSec - The elapsedTimeSec since the program started. Used for mapping implementations which are time dependent. Ignored if NOT applicable.
   * @returns - A scalar value corresponding to the input coordinate.
   */
  map: (
    inputCoordinateType: ECoordinateType,
    xNorm: number,
    yNorm?: number,
    zNorm?: number,
    elapsedTimeSec?: number
  ) => number;
}

/**
 * A base class for coordinate mapper implementations.
 */
abstract class CoordinateMapperBase implements ICoordinateMapper {
  public readonly amplitude: number;

  /**
   *
   * @param amplitude - The max amplitude of the scaled output.
   */
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

/**
 * Maps input coordinates to output values based on a time varying waveform.
 */
export class CoordinateMapper_Waveform extends CoordinateMapperBase {
  protected periodSec: number;
  protected b: number;

  /**
   *
   * @param amplitude - the maximum amplitude of the scaled output
   * @param frequencyHz - the frequency of the time varying waveform in hz
   */
  constructor(amplitude: number = 1.0, frequencyHz: number) {
    super(amplitude);
    this.periodSec = 1 / frequencyHz;
    this.b = _2PI / this.periodSec;
  }

  public map_1D(xNorm: number, elapsedTimeSec: number = 0.0) {
    return this.amplitude * Math.sin(this.b * xNorm + elapsedTimeSec);
  }

  public map_2D(xNorm: number, yNorm: number, elapsedTimeSec: number = 0.0) {
    const normRadialOffset =
      Math.hypot(xNorm - 0.5, yNorm - 0.5) / HALF_DIAGONAL_UNIT_SQUARE;
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
      HALF_DIAGONAL_UNIT_CUBE;
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

/**
 * Maps input coordinates to output values based on pre-existing 1D data.
 * Supports interpolation and anti-aliasing.
 */
export class CoordinateMapper_Data extends CoordinateMapperBase {
  public data: number[];

  /**
   *
   * @param amplitude - the maximum amplitude of the scaled output.
   * @param data - the pre-existing 1D data from which to interpolate values.
   */
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
      Math.hypot(xNorm - 0.5, yNorm - 0.5) / HALF_DIAGONAL_UNIT_SQUARE;
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
      HALF_DIAGONAL_UNIT_CUBE;
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

/**
 * Maps input coordinates to output values based on the superposition of multiple time varying waveforms.
 */
export class CoordinateMapper_WaveformSuperposition
  implements ICoordinateMapper
{
  private mappers: CoordinateMapper_Waveform[];
  public readonly amplitude: number;

  /**
   * @param waveformFrequenciesHz - the frequency (in hz) for each of the time varying waveforms
   * @param maxAmplitude - the maximum amplitude of the scaled output (after superposition)
   * @param amplitudeSplitRatio - the recursive split ratio controlling how amplitude is divided among the various waveforms
   */
  constructor(
    waveformFrequenciesHz: number[],
    maxAmplitude: number = 1.0,
    amplitudeSplitRatio: number = 0.75
  ) {
    this.amplitude = maxAmplitude;
    this.mappers = [];
    for (let i = 0; i < waveformFrequenciesHz.length; i++) {
      // Split the total amplitude among the various waves
      const amplitude =
        i >= waveformFrequenciesHz.length - 1
          ? maxAmplitude
          : amplitudeSplitRatio * maxAmplitude;
      maxAmplitude -= amplitude;

      this.mappers.push(
        new CoordinateMapper_Waveform(amplitude, waveformFrequenciesHz[i])
      );
    }
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
