/**
 * Tracks scalar values
 */
export interface IScalarTracker {
  set(value: number): void;
  get(): number;
}
