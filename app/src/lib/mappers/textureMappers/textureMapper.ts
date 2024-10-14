import { DataTexture, RGBAFormat } from "three";

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
  public maxAmplitude = 4.0;
  private readonly M: number = 4;

  constructor(params: TTextureMapperParams = TextureMapper.PRESETS.DEFAULT) {
    this._params = params;
    this.samplesX = new Float32Array(params.size).fill(0);
    this.samplesY = new Float32Array(params.size).fill(0);
  }

  public updateParams(params: Partial<TTextureMapperParams>): void {
    this._params = {
      ...this._params,
      ...params,
    };
    this.samplesX = new Float32Array(this._params.size).fill(0);
    this.samplesY = new Float32Array(this._params.size).fill(0);
  }

  public updateTextureData(data: Uint8Array): void {
    const B = (1 << 16) - 1;
    let j, x, y;
    for (let i = 0; i < this.samplesX.length; i++) {
      x = Math.max(
        0,
        Math.min(
          2 * this.maxAmplitude,
          0.5 + (0.5 * this.samplesX[i]) / this.maxAmplitude,
        ),
      );
      y = Math.max(
        0,
        Math.min(
          2 * this.maxAmplitude,
          0.5 + (0.5 * this.samplesY[i]) / this.maxAmplitude,
        ),
      );

      x = (x * B) | 0;
      y = (y * B) | 0;
      j = i * this.M;
      data[j + 0] = x >> 8;
      data[j + 1] = x & 0xff;
      data[j + 2] = y >> 8;
      data[j + 3] = y & 0xff;
    }
  }

  public generateSupportedTextureAndData() {
    const textureData = new Uint8Array(this.samplesX.length * this.M);
    const tex = new DataTexture(
      textureData,
      this.samplesX.length,
      1,
      RGBAFormat,
    );
    return {
      tex: tex,
      textureData: textureData,
    };
  }
}
