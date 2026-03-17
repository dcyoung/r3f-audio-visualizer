import type { Vector3 } from "three";

export const WORKGROUP_SIZE = 64;
export const FIXED_POINT_MULTIPLIER = 1e7;
export const PARTICLE_STRUCT_SIZE = 20; // vec3(4) + vec3(4) + mat3(12) with alignment

export interface FluidSimulationConfig {
  maxParticles: number;
  gridSize: number;
  initialParticleCount: number;
  stiffness: number;
  restDensity: number;
  dynamicViscosity: number;
  gravity: Vector3;
  /** Fill region in normalized [0,1] space for initial particle positions */
  initialFillRegion: {
    min: Vector3;
    max: Vector3;
  };
}

export const DEFAULT_FLUID_CONFIG: Omit<
  FluidSimulationConfig,
  "gravity" | "initialFillRegion"
> = {
  maxParticles: 8192 * 16,
  gridSize: 64,
  initialParticleCount: 8192 * 9,
  stiffness: 50,
  restDensity: 1.5,
  dynamicViscosity: 0.1,
};

export interface FluidSimulationUniforms {
  particleCount: { value: number };
  gridSize: { value: Vector3 };
  stiffness: { value: number };
  restDensity: { value: number };
  dynamicViscosity: { value: number };
  dt: { value: number };
  gravity: { value: Vector3 };
  externalForce: { value: Vector3 };
  /** Lower boundary wall positions in normalized [0,1] space */
  boundaryMin: { value: Vector3 };
  /** Upper boundary wall positions in normalized [0,1] space */
  boundaryMax: { value: Vector3 };
}

export interface FluidKernels {
  workgroup: ReturnType<typeof Object>;
  clearGrid: ReturnType<typeof Object>;
  p2g1: ReturnType<typeof Object>;
  p2g2: ReturnType<typeof Object>;
  updateGrid: ReturnType<typeof Object>;
  g2p: ReturnType<typeof Object>;
}

export interface FluidSimulationResources {
  uniforms: FluidSimulationUniforms;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  particleBuffer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kernels: any;

  workgroupBuffers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p2g1: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p2g2: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    g2p: any;
  };
  config: FluidSimulationConfig;
}

/** Resolution of the radius map for morphing_sphere boundary mode */
export const SPHERE_MAP_THETA_RES = 32;
export const SPHERE_MAP_PHI_RES = 16;

/**
 * Boundary mode determines how particles are confined.
 * - "box": Axis-aligned box with dynamic wall positions
 * - "cylinder": Cylindrical containment with dynamic floor height
 * - "sphere": Radial containment with hard spherical boundary
 * - "morphing_sphere": Inner boundary from a per-direction radius map + radial gravity
 */
export type BoundaryMode = "box" | "cylinder" | "sphere" | "morphing_sphere";
