import {
  CoordinateMapperBase,
  cubeFaceCenterRadialOffset,
  HALF_DIAGONAL_UNIT_CUBE,
  HALF_DIAGONAL_UNIT_SQUARE,
  TWO_PI,
  type CoordinateType,
  type ICoordinateMapper,
} from "@/lib/mappers/coordinateMappers/common";

/**
 * Maps input coordinates to output values based on a time varying waveform.
 */
export class CoordinateMapper_Waveform extends CoordinateMapperBase {
  public readonly frequencyHz: number;
  protected periodSec: number;
  protected b: number;

  /**
   *
   * @param amplitude - the maximum amplitude of the scaled output
   * @param frequencyHz - the frequency of the time varying waveform in hz
   */
  constructor(amplitude = 1.0, frequencyHz: number) {
    super(amplitude);
    this.frequencyHz = frequencyHz;
    this.periodSec = 1 / frequencyHz;
    this.b = TWO_PI / this.periodSec;
  }

  public map_1D(xNorm: number, elapsedTimeSec = 0.0): number {
    return this.amplitude * Math.sin(this.b * xNorm + elapsedTimeSec);
  }

  public map_2D(xNorm: number, yNorm: number, elapsedTimeSec = 0.0): number {
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
    elapsedTimeSec = 0.0,
  ): number {
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
    elapsedTimeSec = 0.0,
  ): number {
    const normRadialOffset = cubeFaceCenterRadialOffset(
      xNorm,
      yNorm,
      zNorm,
      1.0,
    );
    return (
      this.amplitude * Math.sin(this.b * normRadialOffset + elapsedTimeSec)
    );
  }
}

export type TSuperPositionParams = {
  waveformFrequenciesHz: number[];
  maxAmplitude: number;
  amplitudeSplitRatio: number;
};
/**
 * Maps input coordinates to output values based on the superposition of multiple time varying waveforms.
 */
export class CoordinateMapper_WaveformSuperposition
  implements ICoordinateMapper
{
  public static get PRESETS() {
    return {
      DEFAULT: {
        waveformFrequenciesHz: [2.0],
        maxAmplitude: 1.0,
        amplitudeSplitRatio: 0.75,
      },
      DOUBLE: {
        waveformFrequenciesHz: [2.0, 10.0],
        maxAmplitude: 1.0,
        amplitudeSplitRatio: 0.75,
      },
      CUSTOM: {},
    };
  }

  public clone(params: Partial<TSuperPositionParams>) {
    return new CoordinateMapper_WaveformSuperposition({
      ...this._params,
      ...params,
    });
  }

  private mappers: CoordinateMapper_Waveform[];
  private _params: TSuperPositionParams;
  public get params(): TSuperPositionParams {
    return this._params;
  }
  public get amplitude() {
    return this.params.maxAmplitude;
  }

  /**
   * @param waveformFrequenciesHz - the frequency (in hz) for each of the time varying waveforms
   * @param maxAmplitude - the maximum amplitude of the scaled output (after superposition)
   * @param amplitudeSplitRatio - the recursive split ratio controlling how amplitude is divided among the various waveforms
   */
  constructor(
    params: TSuperPositionParams = CoordinateMapper_WaveformSuperposition
      .PRESETS.DEFAULT,
  ) {
    this._params = params;
    this.mappers = CoordinateMapper_WaveformSuperposition.genMappersForParams(
      this.params,
    );
  }

  private static genMappersForParams(params: TSuperPositionParams) {
    let maxAmplitude = params.maxAmplitude;
    return Array.from({ length: params.waveformFrequenciesHz.length }).map(
      (_, i) => {
        // Split the total amplitude among the various waves
        // const amplitude = i > 0 ? params.amplitudeSplitRatio * maxAmplitude : maxAmplitude;
        const amplitude =
          i >= params.waveformFrequenciesHz.length - 1
            ? maxAmplitude
            : params.amplitudeSplitRatio * maxAmplitude;
        maxAmplitude -= amplitude;
        return new CoordinateMapper_Waveform(
          amplitude,
          params.waveformFrequenciesHz[i],
        );
      },
    );
  }

  public map(
    inputCoordinateType: CoordinateType,
    xNorm: number,
    yNorm = 0.0,
    zNorm = 0.0,
    elapsedTimeSec = 0.0,
  ): number {
    let superposition = 0;
    for (const mapper of this.mappers) {
      superposition += mapper.map(
        inputCoordinateType,
        xNorm,
        yNorm,
        zNorm,
        elapsedTimeSec,
      );
    }
    return superposition;
  }
}
