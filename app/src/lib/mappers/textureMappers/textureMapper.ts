import { DataTexture, FloatType, NearestFilter, RGBAFormat } from "three";

export type TTextureMapperParams = {
  size: number;
};
export class TextureMapper {
  public static get PRESETS() {
    return {
      DEFAULT: {
        size: 512,
      },
    };
  }
  public clone(params: Partial<TTextureMapperParams>) {
    return new TextureMapper({
      ...this._params,
      ...params,
    });
  }
  private _params: TTextureMapperParams;
  public get params(): TTextureMapperParams {
    return {
      ...this.params,
    };
  }
  public samplesX: Float32Array;
  public samplesY: Float32Array;
  public angularVelocity: Float32Array;
  public noise: Float32Array;
  public maxAmplitude = 4.0;
  private readonly CHANNELS: number = 4;

  constructor(params: TTextureMapperParams = TextureMapper.PRESETS.DEFAULT) {
    this._params = params;
    this.samplesX = new Float32Array(params.size).fill(0);
    this.samplesY = new Float32Array(params.size).fill(0);
    this.angularVelocity = new Float32Array(params.size).fill(0);
    this.noise = new Float32Array(params.size).fill(0);
  }

  public updateParams(params: Partial<TTextureMapperParams>): void {
    this._params = {
      ...this._params,
      ...params,
    };
    const n = this._params.size;
    this.samplesX = new Float32Array(n).fill(0);
    this.samplesY = new Float32Array(n).fill(0);
    this.angularVelocity = new Float32Array(n).fill(0);
    this.noise = new Float32Array(n).fill(0);
  }

  /**
   * Pack [x, y, angularVelocity, noise] as raw floats into the RGBA float texture.
   */
  public updateTextureData(data: Float32Array): void {
    for (let i = 0; i < this.samplesX.length; i++) {
      const j = i * this.CHANNELS;
      data[j + 0] = this.samplesX[i];
      data[j + 1] = this.samplesY[i];
      data[j + 2] = this.angularVelocity[i];
      data[j + 3] = this.noise[i];
    }
  }

  public generateSupportedTextureAndData() {
    const textureData = new Float32Array(this.samplesX.length * this.CHANNELS);
    const tex = new DataTexture(
      textureData,
      this.samplesX.length,
      1,
      RGBAFormat,
      FloatType,
    );
    tex.minFilter = NearestFilter;
    tex.magFilter = NearestFilter;
    return {
      tex,
      textureData,
    };
  }
}
