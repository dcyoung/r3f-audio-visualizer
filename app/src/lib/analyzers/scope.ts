import { type TAnalyzerInputControl } from "./common";

function createBufferCopy(
  context: AudioContext,
  buffer: Float32Array<ArrayBuffer>,
) {
  const copyNode = context.createScriptProcessor(buffer.length, 1, 1);
  copyNode.onaudioprocess = (e) => {
    e.inputBuffer.copyFromChannel(buffer, 0);
  };
  return copyNode;
}

function createHilbertFilter(
  context: AudioContext,
  filterLength: number,
): [DelayNode, ConvolverNode] {
  if (filterLength % 2 === 0) {
    filterLength -= 1;
  }
  const impulse = new Float32Array(filterLength);

  const mid = ((filterLength - 1) / 2) | 0;

  for (let i = 0; i <= mid; i++) {
    // hamming window
    const k = 0.53836 + 0.46164 * Math.cos((i * Math.PI) / (mid + 1));
    if (i % 2 === 1) {
      const im = 2 / Math.PI / i;
      impulse[mid + i] = k * im;
      impulse[mid - i] = k * -im;
    }
  }

  const impulseBuffer = context.createBuffer(
    2,
    filterLength,
    context.sampleRate,
  );
  impulseBuffer.copyToChannel(impulse, 0);
  impulseBuffer.copyToChannel(impulse, 1);
  const hilbert = context.createConvolver();
  hilbert.normalize = false;
  hilbert.buffer = impulseBuffer;

  const delayTime = mid / context.sampleRate;
  const delay = context.createDelay(delayTime);
  delay.delayTime.value = delayTime;

  return [delay, hilbert];
}

/**
 * Compute the angle between two complex vectors, scaled to [0, 0.5].
 * Uses the numerically stable half-angle formula:
 *   2 * atan2(|‖v‖u − ‖u‖v|, |‖v‖u + ‖u‖v|)
 */
function getAngle(vRe: number, vIm: number, uRe: number, uIm: number): number {
  const lenV = Math.sqrt(vRe * vRe + vIm * vIm);
  const lenU = Math.sqrt(uRe * uRe + uIm * uIm);
  const lvuRe = lenV * uRe;
  const lvuIm = lenV * uIm;
  const luvRe = lenU * vRe;
  const luvIm = lenU * vIm;
  const leftRe = lvuRe - luvRe;
  const leftIm = lvuIm - luvIm;
  const left = Math.sqrt(leftRe * leftRe + leftIm * leftIm);
  const rightRe = lvuRe + luvRe;
  const rightIm = lvuIm + luvIm;
  const right = Math.sqrt(rightRe * rightRe + rightIm * rightIm);
  return Math.atan2(left, right) / Math.PI;
}

/**
 * Biquad lowpass filter (Direct Form II Transposed).
 * @param n - normalized cutoff frequency (0..1, where 1 = Nyquist)
 * @param q - quality factor
 */
function createLowpass(n: number, q: number): (x: number) => number {
  const k = Math.tan(0.5 * n * Math.PI);
  const norm = 1.0 / (1.0 + k / q + k * k);
  const a0 = k * k * norm;
  const a1 = 2.0 * a0;
  const a2 = a0;
  const b1 = 2.0 * (k * k - 1.0) * norm;
  const b2 = (1.0 - k / q + k * k) * norm;
  let w1 = 0;
  let w2 = 0;
  return (x: number) => {
    const w0 = x - b1 * w1 - b2 * w2;
    const y = a0 * w0 + a1 * w1 + a2 * w2;
    w2 = w1;
    w1 = w0;
    return y;
  };
}

export default class ScopeAnalyzer implements TAnalyzerInputControl {
  public readonly _audioCtx: AudioContext;
  public readonly timeSamples: Float32Array<ArrayBuffer>;
  public readonly quadSamples: Float32Array<ArrayBuffer>;
  public readonly angularVelocity: Float32Array<ArrayBuffer>;
  public readonly noise: Float32Array<ArrayBuffer>;
  private _sources: AudioNode[];
  private _inputs: AudioNode[];
  public volume = 1.0;

  private _prevRe = 0;
  private _prevIm = 0;
  private _prevDiffRe = 0;
  private _prevDiffIm = 0;
  private _angleLp: (x: number) => number;
  private _noiseLp: (x: number) => number;

  constructor(
    source: HTMLAudioElement,
    audioContext: AudioContext | undefined = undefined,
    n = 512,
    fftSize = 1024,
  ) {
    if (audioContext === undefined) {
      this._audioCtx = new window.AudioContext();
    } else {
      this._audioCtx = audioContext;
    }
    this.timeSamples = new Float32Array(n);
    this.quadSamples = new Float32Array(n);
    this.angularVelocity = new Float32Array(n);
    this.noise = new Float32Array(n);
    this._angleLp = createLowpass(0.05, 0.7);
    this._noiseLp = createLowpass(0.05, 0.7);

    const [delay, hilbert] = createHilbertFilter(this._audioCtx, fftSize - n);
    this._inputs = [delay, hilbert];
    const time = createBufferCopy(this._audioCtx, this.timeSamples);
    const quad = createBufferCopy(this._audioCtx, this.quadSamples);

    // Routing
    // (source) -->  hilbert --> time --> (destination)
    //          -->  delay   --> quad --> (destination)
    //          --> (destination)
    const sourceNode = this._audioCtx.createMediaElementSource(source);
    this._sources = [];
    this.connectInput(sourceNode);
    hilbert.connect(time);
    delay.connect(quad);
    time.connect(this._audioCtx.destination);
    quad.connect(this._audioCtx.destination);
    sourceNode.connect(this._audioCtx.destination);
  }

  /**
   * Compute per-sample angular velocity and noise from the current
   * analytic signal (timeSamples = imaginary/Hilbert, quadSamples = real/delayed).
   * Must be called each frame after the ScriptProcessors have updated the buffers.
   */
  computeColorData(): void {
    const N = this.timeSamples.length;
    for (let i = 0; i < N; i++) {
      const re = this.quadSamples[i];
      const im = this.timeSamples[i];

      const diffRe = re - this._prevRe;
      const diffIm = im - this._prevIm;
      this._prevRe = re;
      this._prevIm = im;

      const angle = Math.abs(
        getAngle(diffRe, diffIm, this._prevDiffRe, this._prevDiffIm),
      );
      const logAngle = Math.max(-1e12, Math.log2(Math.max(angle, 1e-20)));

      this._prevDiffRe = diffRe;
      this._prevDiffIm = diffIm;

      const smoothed = this._angleLp(logAngle);
      this.angularVelocity[i] = Math.pow(2, smoothed);
      this.noise[i] = this._noiseLp(Math.abs(logAngle - smoothed));
    }
  }

  disconnectInputs(): void {
    for (const node of Array.from(this._sources)) {
      const idx = this._sources.indexOf(node);
      if (idx >= 0) {
        for (const inputNode of this._inputs) {
          node.disconnect(inputNode);
        }
        this._sources.splice(idx, 1);
      }
    }
  }

  connectInput(source: AudioNode): void {
    if (!source.connect) {
      throw new Error("Audio source must be an instance of AudioNode");
    }

    if (!this._sources.includes(source)) {
      for (const input of this._inputs) {
        source.connect(input);
      }
      this._sources.push(source);
    }
  }
}
