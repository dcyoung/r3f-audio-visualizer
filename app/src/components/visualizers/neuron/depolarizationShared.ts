/**
 * Default depolarization band (world units). Shared by the GPU depolarization path and efflux lag
 * tuning in `reactive.tsx`.
 */
export const DEFAULT_DEPOLARIZATION_BAND_WIDTH = 2.25;

/** Discrete particle totals exposed in neuron controls (slider index 0…4). */
export const NEURON_PARTICLE_COUNT_TIERS = [
  100_000, 250_000, 500_000, 750_000, 1_000_000,
] as const;

/** Default tier index (`500k`). */
export const DEFAULT_NEURON_PARTICLE_TIER_INDEX = 2;

/** Default per-particle alpha scale (pairs with default tier for additive blending). */
export const DEFAULT_NEURON_PARTICLE_INTENSITY_SCALE = 0.4;
