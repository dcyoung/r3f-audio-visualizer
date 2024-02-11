import { Clock } from "three";

export interface IEventDetector {
  reset(): void;
  observe(scalar: number): void;
  triggered(): boolean;
}

export class ScalarMovingAvgEventDetector implements IEventDetector {
  private clock = new Clock(true);
  private bufferSize = 1000;
  private elapsedTimeMsSinceLastEvent = 0;
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

  public reset() {
    // reset the delta & old time
    this.elapsedTimeMsSinceLastEvent = 0;
    this.observationCount = 0;
  }

  public observe(scalar: number) {
    const idx = this.observationCount % this.bufferSize;
    this.buffer[idx].value = scalar;
    this.buffer[idx].elapsedTimeMs = this.clock.getElapsedTime() * 1000;
    this.observationCount++;
  }

  public triggered(): boolean {
    const ms = this.clock.getElapsedTime() * 1000;
    const delta = ms - this.elapsedTimeMsSinceLastEvent;

    if (delta < this.cooldownMs) {
      return false;
    }

    const stats = this.buffer.reduce(
      (acc, entry) => {
        if (entry.elapsedTimeMs < ms - this.windowSizeMs) {
          return acc;
        }
        return {
          sum: acc.sum + entry.value,
          count: acc.count + 1,
        };
      },
      { sum: 0, count: 0 },
    );
    const avg = stats.count > 0 ? stats.sum / stats.count : 0;
    return avg > this.threshold;
  }
}
