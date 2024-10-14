/**
 * Tracks scalar values
 */
export interface IScalarTracker {
  set(value: number): void;
  get(): number;
}

export const NoOpScalarTracker: IScalarTracker = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set: () => {},
  get: () => 0,
};
