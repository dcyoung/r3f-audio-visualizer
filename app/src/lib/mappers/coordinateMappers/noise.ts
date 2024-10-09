import {
  CoordinateMapperBase,
  cubeFaceCenterRadialOffset,
} from "@/lib/mappers/coordinateMappers/common";
import {
  createNoise2D,
  createNoise3D,
  createNoise4D,
  type NoiseFunction2D,
  type NoiseFunction3D,
  type NoiseFunction4D,
} from "simplex-noise";

export type TCoordinateMapper_NoiseParams = {
  amplitude: number;
  spatialScale: number;
  timeScale: number;
  nIterations: number;
  persistence: number;
};
/**
 * Maps input coordinates to output values based on the noise functions.
 */
export class CoordinateMapper_Noise extends CoordinateMapperBase {
  public static get PRESETS() {
    return {
      DEFAULT: {
        amplitude: 1.0,
        spatialScale: 2.0,
        timeScale: 0.5,
        nIterations: 10,
        persistence: 0.5,
      },
    };
  }
  public clone(params: Partial<TCoordinateMapper_NoiseParams>) {
    return new CoordinateMapper_Noise({
      ...this._params,
      ...params,
    });
  }
  private _params: TCoordinateMapper_NoiseParams;
  public get params(): TCoordinateMapper_NoiseParams {
    return this._params;
  }
  private readonly noise2D: NoiseFunction2D;
  private readonly noise3D: NoiseFunction3D;
  private readonly noise4D: NoiseFunction4D;

  /**
   *
   * @param amplitude - the maximum amplitude of the scaled output.
   */
  constructor(
    params: TCoordinateMapper_NoiseParams = CoordinateMapper_Noise.PRESETS
      .DEFAULT,
  ) {
    super(params.amplitude);
    this._params = params;
    this.noise2D = createNoise2D();
    this.noise3D = createNoise3D();
    this.noise4D = createNoise4D();
  }

  public map_1D(xNorm: number, elapsedTimeSec = 0.0): number {
    let noise = 0,
      maxAmp = 0,
      amp = this.amplitude,
      spatialScale = this._params.spatialScale;
    const timeScale = this._params.timeScale;

    for (let i = 0; i < this._params.nIterations; i++) {
      noise +=
        amp * this.noise2D(xNorm * spatialScale, elapsedTimeSec * timeScale);
      maxAmp += amp;
      amp *= this._params.persistence;
      spatialScale *= 2;
    }

    return this._params.nIterations > 1 ? noise / maxAmp : noise;
  }

  public map_2D(xNorm: number, yNorm: number, elapsedTimeSec = 0.0): number {
    let noise = 0,
      maxAmp = 0,
      amp = this.amplitude,
      spatialScale = this._params.spatialScale;
    const timeScale = this._params.timeScale;

    for (let i = 0; i < this._params.nIterations; i++) {
      noise +=
        amp *
        this.noise3D(
          xNorm * spatialScale,
          yNorm * spatialScale,
          elapsedTimeSec * timeScale,
        );
      maxAmp += amp;
      amp *= this._params.persistence;
      spatialScale *= 2;
    }

    return this._params.nIterations > 1 ? noise / maxAmp : noise;
  }

  public map_3D(
    xNorm: number,
    yNorm: number,
    zNorm: number,
    elapsedTimeSec = 0.0,
  ): number {
    let noise = 0,
      maxAmp = 0,
      amp = this.amplitude,
      spatialScale = this._params.spatialScale;
    const timeScale = this._params.timeScale;

    for (let i = 0; i < this._params.nIterations; i++) {
      noise +=
        amp *
        this.noise4D(
          xNorm * spatialScale,
          yNorm * spatialScale,
          zNorm * spatialScale,
          elapsedTimeSec * timeScale,
        );
      maxAmp += amp;
      amp *= this._params.persistence;
      spatialScale *= 2;
    }

    return this._params.nIterations > 1 ? noise / maxAmp : noise;
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
