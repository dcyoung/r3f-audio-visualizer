import { Clock } from "three";

export class EventDetector {
  private clock = new Clock(true);
  private lastEventElapsedMs = 0;

  constructor() {
    this.clock.getElapsedTime();
  }

  public get msSinceLastEvent() {
    return this.clock.getElapsedTime() * 1000 - this.lastEventElapsedMs;
  }

  public addEvent() {
    this.lastEventElapsedMs = this.clock.getElapsedTime() * 1000;
  }
}
