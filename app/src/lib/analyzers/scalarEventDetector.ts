export class ScalarMovingAvgEventDetector {
  private startMs = performance.now();
  private bufferSize = 1000;
  private lastEventElapsedMs = 0;

  private get elapsedMs() {
    return performance.now() - this.startMs;
  }

  public get timeSinceLastEventMs() {
    return this.elapsedMs - this.lastEventElapsedMs;
  }

  private buffer: {
    value: number;
    elapsedTimeMs: number;
  }[] = Array.from({ length: this.bufferSize }).map(() => ({
    value: 0,
    elapsedTimeMs: 0,
  }));

  private threshold: number;
  private windowSizeMs: number;
  private cooldownMs: number;
  private observationCount = 0;

  constructor(threshold = 0.5, windowSizeMs = 150, cooldownMs = 500) {
    this.threshold = threshold;
    this.windowSizeMs = windowSizeMs;
    this.cooldownMs = cooldownMs;
  }

  private getBufferAvg(windowEndTimestampMs: number) {
    const start = windowEndTimestampMs - this.windowSizeMs;
    const end = windowEndTimestampMs;
    const stats = this.buffer.reduce(
      (acc, entry) => {
        if (entry.elapsedTimeMs < start || entry.elapsedTimeMs > end) {
          return acc;
        }
        return {
          sum: acc.sum + entry.value,
          count: acc.count + 1,
        };
      },
      { sum: 0, count: 0 },
    );
    return stats.count > 0 ? stats.sum / stats.count : 0;
  }

  public step(scalar: number) {
    const ms = this.elapsedMs;
    const idx = this.observationCount % this.bufferSize;
    this.buffer[idx].value = scalar;
    this.buffer[idx].elapsedTimeMs = ms;
    this.observationCount++;

    if (this.timeSinceLastEventMs < this.cooldownMs) {
      return false;
    }

    const avg = this.getBufferAvg(ms);
    if (avg > this.threshold) {
      this.lastEventElapsedMs = ms;
      return true;
    }
    return false;
  }
}
