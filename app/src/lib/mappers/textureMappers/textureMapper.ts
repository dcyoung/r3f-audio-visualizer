import { DataTexture, RGBAFormat } from "three";

export class TextureMapper {
  public readonly samplesX: Float32Array;
  public readonly samplesY: Float32Array;
  public maxAmplitude = 4.0;
  private readonly M: number = 4;

  constructor(samplesX: Float32Array, samplesY: Float32Array) {
    if (samplesX.length != samplesY.length) {
      throw new Error("sample size mismatch");
    }
    this.samplesX = samplesX;
    this.samplesY = samplesY;
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
