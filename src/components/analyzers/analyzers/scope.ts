function createBufferCopy(context: AudioContext, buffer: Float32Array) {
  let copyNode = context.createScriptProcessor(buffer.length, 1, 1);
  copyNode.onaudioprocess = (e) => {
    e.inputBuffer.copyFromChannel(buffer, 0);
  };
  return copyNode;
}

function createHilbertFilter(
  context: AudioContext,
  filterLength: number
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
    context.sampleRate
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

export default class ScopeAnalyzer {
  public readonly _audioCtx: AudioContext;
  public readonly timeSamples: Float32Array;
  public readonly quadSamples: Float32Array;

  constructor(
    source: HTMLAudioElement,
    n: number = 512,
    fftSize: number = 1024
  ) {
    this._audioCtx = new window.AudioContext();
    this.timeSamples = new Float32Array(n);
    this.quadSamples = new Float32Array(n);
    const [delay, hilbert] = createHilbertFilter(this._audioCtx, fftSize - n);
    const time = createBufferCopy(this._audioCtx, this.timeSamples);
    const quad = createBufferCopy(this._audioCtx, this.quadSamples);

    // Routing
    // (source) -->  hilbert --> time --> (destination)
    //          -->  delay   --> quad --> (destination)
    //          --> (destination)
    const input = this._audioCtx.createMediaElementSource(source);
    input.connect(delay);
    input.connect(hilbert);
    hilbert.connect(time);
    delay.connect(quad);
    time.connect(this._audioCtx.destination);
    quad.connect(this._audioCtx.destination);
    input.connect(this._audioCtx.destination);
  }
}
