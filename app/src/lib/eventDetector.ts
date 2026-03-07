export class EventDetector {
  private startMs = performance.now();
  private lastEventElapsedMs = 0;

  private get elapsedMs() {
    return performance.now() - this.startMs;
  }

  public get msSinceLastEvent() {
    return this.elapsedMs - this.lastEventElapsedMs;
  }

  public addEvent() {
    this.lastEventElapsedMs = this.elapsedMs;
  }
}
