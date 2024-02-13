import { Clock } from "three";

export class ScalarMovingAvgEventDetector {
  private clock = new Clock(true);
  private bufferSize = 1000;
  private lastEventElapsedMs = 0;
  public get timeSinceLastEventMs() {
    return this.clock.elapsedTime * 1000 - this.lastEventElapsedMs;
  }
  private buffer: {
    value: number;
    elapsedTimeMs: number;
  }[] = Array.from({ length: this.bufferSize }).map((_) => ({
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
    const ms = this.clock.getElapsedTime() * 1000;
    // Add the observation
    const idx = this.observationCount % this.bufferSize;
    this.buffer[idx].value = scalar;
    this.buffer[idx].elapsedTimeMs = ms;
    this.observationCount++;

    // Can't trigger in cooldown
    if (this.timeSinceLastEventMs < this.cooldownMs) {
      return false;
    }

    // Check for trigger
    const avg = this.getBufferAvg(ms);
    if (avg > this.threshold) {
      // reset
      this.lastEventElapsedMs = ms;
      return true;
    }
    return false;
  }
}
