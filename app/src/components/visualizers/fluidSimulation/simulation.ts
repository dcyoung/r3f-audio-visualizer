/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Vector3 } from "three";
import {
  acos,
  array,
  atan,
  atomicAdd,
  atomicLoad,
  atomicStore,
  clamp,
  float,
  floor,
  Fn,
  If,
  instancedArray,
  instanceIndex,
  int,
  ivec3,
  Loop,
  mat3,
  max,
  pow,
  Return,
  storage,
  struct,
  uint,
  uniform,
  vec3,
  vec4,
} from "three/tsl";
import type { Mesh } from "three/webgpu";
import {
  IndirectStorageBufferAttribute,
  StorageBufferAttribute,
  type WebGPURenderer,
} from "three/webgpu";

import {
  FIXED_POINT_MULTIPLIER,
  PARTICLE_STRUCT_SIZE,
  SPHERE_MAP_PHI_RES,
  SPHERE_MAP_THETA_RES,
  WORKGROUP_SIZE,
  type BoundaryMode,
  type FluidSimulationConfig,
} from "./types";

export interface SimulationInstance {
  uniforms: {
    particleCount: any;
    gridSize: any;
    stiffness: any;
    restDensity: any;
    dynamicViscosity: any;
    dt: any;
    gravity: any;
    externalForce: any;
    boundaryMin: any;
    boundaryMax: any;
  };
  particleBuffer: any;
  kernels: {
    workgroup: any;
    clearGrid: any;
    p2g1: any;
    p2g2: any;
    updateGrid: any;
    g2p: any;
  };
  workgroupBuffers: {
    p2g1: IndirectStorageBufferAttribute;
    p2g2: IndirectStorageBufferAttribute;
    g2p: IndirectStorageBufferAttribute;
  };
  config: FluidSimulationConfig;
  setParticleCount: (count: number, mesh: Mesh) => void;
  step: (renderer: WebGPURenderer) => void;
  /** Per-direction radius map for morphing_sphere boundary mode (CPU-writable). */
  radiusMap?: {
    array: Float32Array;
    attribute: StorageBufferAttribute;
  };
}

function initParticleArray(
  config: FluidSimulationConfig,
  boundaryMode: BoundaryMode,
): Float32Array {
  const arr = new Float32Array(config.maxParticles * PARTICLE_STRUCT_SIZE);
  const { min, max } = config.initialFillRegion;
  const range = { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z };

  const isSphere =
    boundaryMode === "sphere" || boundaryMode === "morphing_sphere";
  const innerR = isSphere ? (max.x - min.x) / 2 - 0.16 : 0;
  const outerR = isSphere ? (max.x - min.x) / 2 : 0;
  const cx = (min.x + max.x) / 2;
  const cy = (min.y + max.y) / 2;
  const cz = (min.z + max.z) / 2;

  for (let i = 0; i < config.maxParticles; i++) {
    const offset = i * PARTICLE_STRUCT_SIZE;

    if (isSphere) {
      // Rejection sampling: place particles only within the spherical shell
      let x: number, y: number, z: number, dist: number;
      do {
        x = Math.random() * range.x + min.x;
        y = Math.random() * range.y + min.y;
        z = Math.random() * range.z + min.z;
        const dx = x - cx,
          dy = y - cy,
          dz = z - cz;
        dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      } while (dist < innerR || dist > outerR);
      arr[offset] = x;
      arr[offset + 1] = y;
      arr[offset + 2] = z;
    } else {
      arr[offset] = Math.random() * range.x + min.x;
      arr[offset + 1] = Math.random() * range.y + min.y;
      arr[offset + 2] = Math.random() * range.z + min.z;
    }
  }
  return arr;
}

const encodeFixedPoint = (f32: any): any =>
  int(f32.mul(FIXED_POINT_MULTIPLIER));

const decodeFixedPoint = (i32: any): any =>
  float(i32).div(FIXED_POINT_MULTIPLIER);

function computeWeights(cellDiff: any): any {
  const w0 = float(0.5)
    .mul(float(0.5).sub(cellDiff))
    .mul(float(0.5).sub(cellDiff));
  const w1 = float(0.75).sub(cellDiff.mul(cellDiff));
  const w2 = float(0.5)
    .mul(float(0.5).add(cellDiff))
    .mul(float(0.5).add(cellDiff));
  return (array as any)([w0, w1, w2]).toConst("weights");
}

function gridIndex(cellX: any, gridSizeY: number, gridSizeZ: number): any {
  return cellX.x
    .mul(int(gridSizeY * gridSizeZ))
    .add(cellX.y.mul(int(gridSizeZ)))
    .add(cellX.z)
    .toConst();
}

export function createFluidSimulation(
  config: FluidSimulationConfig,
  boundaryMode: BoundaryMode,
): SimulationInstance {
  const gs = config.gridSize;
  const gridSizeVec = new Vector3(gs, gs, gs);
  const cellCount = gs * gs * gs;

  // --- Buffers ---
  const particleStruct = struct({
    position: { type: "vec3" },
    velocity: { type: "vec3" },
    C: { type: "mat3" },
  } as any);

  const particleArray = initParticleArray(config, boundaryMode);
  const particleBuffer: any = (instancedArray as any)(
    particleArray,
    particleStruct,
  );

  const cellStruct = struct({
    x: { type: "int", atomic: true },
    y: { type: "int", atomic: true },
    z: { type: "int", atomic: true },
    mass: { type: "int", atomic: true },
  } as any);

  const cellBuffer: any = (instancedArray as any)(cellCount, cellStruct);
  const cellBufferFloat: any = (instancedArray as any)(cellCount, "vec4");

  // --- Uniforms ---
  const gridSizeUniform: any = uniform(gridSizeVec);
  const particleCountUniform: any = uniform(
    config.initialParticleCount,
    "uint" as any,
  );
  const stiffnessUniform: any = uniform(config.stiffness);
  const restDensityUniform: any = uniform(config.restDensity);
  const dynamicViscosityUniform: any = uniform(config.dynamicViscosity);
  const dtUniform: any = uniform(1 / 60);
  const gravityUniform: any = uniform(config.gravity.clone());
  const externalForceUniform: any = uniform(new Vector3(0, 0, 0));
  const boundaryMinUniform: any = uniform(new Vector3(1 / gs, 1 / gs, 1 / gs));
  const boundaryMaxUniform: any = uniform(
    new Vector3((gs - 1) / gs, (gs - 1) / gs, (gs - 1) / gs),
  );

  const uniforms = {
    particleCount: particleCountUniform,
    gridSize: gridSizeUniform,
    stiffness: stiffnessUniform,
    restDensity: restDensityUniform,
    dynamicViscosity: dynamicViscosityUniform,
    dt: dtUniform,
    gravity: gravityUniform,
    externalForce: externalForceUniform,
    boundaryMin: boundaryMinUniform,
    boundaryMax: boundaryMaxUniform,
  };

  // --- Indirect dispatch buffers ---
  const numWorkgroups = Math.ceil(config.initialParticleCount / WORKGROUP_SIZE);
  const p2g1Wg = new IndirectStorageBufferAttribute(
    new Uint32Array([numWorkgroups, 1, 1]),
    1,
  );
  const p2g2Wg = new IndirectStorageBufferAttribute(
    new Uint32Array([numWorkgroups, 1, 1]),
    1,
  );
  const g2pWg = new IndirectStorageBufferAttribute(
    new Uint32Array([numWorkgroups, 1, 1]),
    1,
  );

  const p2g1WgStorage: any = storage(p2g1Wg, "uint" as any, 3);
  const p2g2WgStorage: any = storage(p2g2Wg, "uint" as any, 3);
  const g2pWgStorage: any = storage(g2pWg, "uint" as any, 3);

  // --- Radius map for morphing_sphere ---
  const radiusMapCount = SPHERE_MAP_THETA_RES * SPHERE_MAP_PHI_RES;
  let radiusMapArray: Float32Array | null = null;
  let radiusMapAttr: StorageBufferAttribute | null = null;
  let radiusMapStorage: any = null;
  if (boundaryMode === "morphing_sphere") {
    radiusMapArray = new Float32Array(radiusMapCount);
    radiusMapArray.fill(0.28);
    radiusMapAttr = new StorageBufferAttribute(radiusMapArray, 1);
    radiusMapStorage = storage(radiusMapAttr, "float" as any, radiusMapCount);
  }

  // --- Kernel: workgroup dispatch counts ---
  const workgroupKernel: any = Fn(() => {
    const wg = particleCountUniform.sub(1).div(WORKGROUP_SIZE).add(1);
    p2g1WgStorage.element(0).assign(wg);
    p2g2WgStorage.element(0).assign(wg);
    g2pWgStorage.element(0).assign(wg);
  })().compute(1);

  // --- Kernel: clear grid ---
  const clearGridKernel: any = Fn(() => {
    If(instanceIndex.greaterThanEqual(uint(cellCount)), () => {
      Return();
    });
    atomicStore(cellBuffer.element(instanceIndex).get("x"), 0);
    atomicStore(cellBuffer.element(instanceIndex).get("y"), 0);
    atomicStore(cellBuffer.element(instanceIndex).get("z"), 0);
    atomicStore(cellBuffer.element(instanceIndex).get("mass"), 0);
  })()
    .compute(cellCount)
    .setName("clearGridKernel");

  // --- Kernel: P2G pass 1 (mass + momentum) ---
  const p2g1Kernel: any = Fn(() => {
    If(instanceIndex.greaterThanEqual(particleCountUniform), () => {
      Return();
    });

    const particlePosition = particleBuffer
      .element(instanceIndex)
      .get("position")
      .toConst("particlePosition");
    const particleVelocity = particleBuffer
      .element(instanceIndex)
      .get("velocity")
      .toConst("particleVelocity");
    const C = particleBuffer.element(instanceIndex).get("C").toConst("C");

    const gridPosition = particlePosition.mul(gridSizeUniform).toVar();
    const cellIdx = ivec3(gridPosition).sub(1).toConst("cellIndex");
    const cellDiff = gridPosition.fract().sub(0.5).toConst("cellDiff");
    const weights = computeWeights(cellDiff);

    Loop(
      { start: 0, end: 3, type: "int", name: "gx", condition: "<" } as any,
      ({ gx }: any) => {
        Loop(
          { start: 0, end: 3, type: "int", name: "gy", condition: "<" } as any,
          ({ gy }: any) => {
            Loop(
              {
                start: 0,
                end: 3,
                type: "int",
                name: "gz",
                condition: "<",
              } as any,
              ({ gz }: any) => {
                const weight = weights
                  .element(gx)
                  .x.mul(weights.element(gy).y)
                  .mul(weights.element(gz).z);
                const cellX = cellIdx.add((ivec3 as any)(gx, gy, gz)).toConst();
                const cellDist = (vec3 as any)(cellX)
                  .add(0.5)
                  .sub(gridPosition)
                  .toConst("cellDist");
                const Q = C.mul(cellDist);
                const massContrib = weight;
                const velContrib = massContrib
                  .mul(particleVelocity.add(Q))
                  .toConst("velContrib");
                const cellPtr = gridIndex(cellX, gs, gs);
                const cell = cellBuffer.element(cellPtr);

                atomicAdd(cell.get("x"), encodeFixedPoint(velContrib.x));
                atomicAdd(cell.get("y"), encodeFixedPoint(velContrib.y));
                atomicAdd(cell.get("z"), encodeFixedPoint(velContrib.z));
                atomicAdd(cell.get("mass"), encodeFixedPoint(massContrib));
              },
            );
          },
        );
      },
    );
  })()
    .compute(config.initialParticleCount, [WORKGROUP_SIZE, 1, 1] as any)
    .setName("p2g1Kernel");

  // --- Kernel: P2G pass 2 (pressure + viscosity stress) ---
  const p2g2Kernel: any = Fn(() => {
    If(instanceIndex.greaterThanEqual(particleCountUniform), () => {
      Return();
    });

    const particlePosition = particleBuffer
      .element(instanceIndex)
      .get("position")
      .toConst("particlePosition");
    const gridPosition = particlePosition.mul(gridSizeUniform).toVar();
    const cellIdx = ivec3(gridPosition).sub(1).toConst("cellIndex");
    const cellDiff = gridPosition.fract().sub(0.5).toConst("cellDiff");
    const weights = computeWeights(cellDiff);

    const density = float(0).toVar("density");
    Loop(
      { start: 0, end: 3, type: "int", name: "gx", condition: "<" } as any,
      ({ gx }: any) => {
        Loop(
          { start: 0, end: 3, type: "int", name: "gy", condition: "<" } as any,
          ({ gy }: any) => {
            Loop(
              {
                start: 0,
                end: 3,
                type: "int",
                name: "gz",
                condition: "<",
              } as any,
              ({ gz }: any) => {
                const weight = weights
                  .element(gx)
                  .x.mul(weights.element(gy).y)
                  .mul(weights.element(gz).z);
                const cellX = cellIdx.add((ivec3 as any)(gx, gy, gz)).toConst();
                const cellPtr = gridIndex(cellX, gs, gs);
                const cell = cellBuffer.element(cellPtr);
                const mass = decodeFixedPoint(atomicLoad(cell.get("mass")));
                density.addAssign(mass.mul(weight));
              },
            );
          },
        );
      },
    );

    const volume = float(1).div(density);
    const pressure = max(
      0.0,
      pow(density.div(restDensityUniform), 5.0).sub(1).mul(stiffnessUniform),
    ).toConst("pressure");
    const stress = (mat3 as any)(
      pressure.negate(),
      0,
      0,
      0,
      pressure.negate(),
      0,
      0,
      0,
      pressure.negate(),
    ).toVar("stress");

    const dudv = particleBuffer.element(instanceIndex).get("C").toConst("dudv");
    const strain = dudv.add(dudv.transpose());
    stress.addAssign(strain.mul(dynamicViscosityUniform));
    const eq16Term0 = (volume as any).mul(-4).mul(stress).mul(dtUniform);

    Loop(
      { start: 0, end: 3, type: "int", name: "gx", condition: "<" } as any,
      ({ gx }: any) => {
        Loop(
          { start: 0, end: 3, type: "int", name: "gy", condition: "<" } as any,
          ({ gy }: any) => {
            Loop(
              {
                start: 0,
                end: 3,
                type: "int",
                name: "gz",
                condition: "<",
              } as any,
              ({ gz }: any) => {
                const weight = weights
                  .element(gx)
                  .x.mul(weights.element(gy).y)
                  .mul(weights.element(gz).z);
                const cellX = cellIdx.add((ivec3 as any)(gx, gy, gz)).toConst();
                const cellDist = (vec3 as any)(cellX)
                  .add(0.5)
                  .sub(gridPosition)
                  .toConst("cellDist");
                const momentum = eq16Term0
                  .mul(weight)
                  .mul(cellDist)
                  .toConst("momentum");
                const cellPtr = gridIndex(cellX, gs, gs);
                const cell = cellBuffer.element(cellPtr);
                atomicAdd(cell.get("x"), encodeFixedPoint(momentum.x));
                atomicAdd(cell.get("y"), encodeFixedPoint(momentum.y));
                atomicAdd(cell.get("z"), encodeFixedPoint(momentum.z));
              },
            );
          },
        );
      },
    );
  })()
    .compute(config.initialParticleCount, [WORKGROUP_SIZE, 1, 1] as any)
    .setName("p2g2Kernel");

  // --- Kernel: update grid (boundary + gravity at grid level) ---
  const updateGridKernel: any = Fn(() => {
    If(instanceIndex.greaterThanEqual(uint(cellCount)), () => {
      Return();
    });

    const cell = cellBuffer.element(instanceIndex);
    const mass = decodeFixedPoint(atomicLoad(cell.get("mass"))).toConst();
    If(mass.lessThanEqual(0), () => {
      Return();
    });

    const vx = decodeFixedPoint(atomicLoad(cell.get("x")))
      .div(mass)
      .toVar();
    const vy = decodeFixedPoint(atomicLoad(cell.get("y")))
      .div(mass)
      .toVar();
    const vz = decodeFixedPoint(atomicLoad(cell.get("z")))
      .div(mass)
      .toVar();

    // Apply gravity at grid level (skip for morphing_sphere: radial gravity is per-particle in G2P)
    if (boundaryMode !== "morphing_sphere") {
      vx.addAssign(gravityUniform.x.mul(dtUniform));
      vy.addAssign(gravityUniform.y.mul(dtUniform));
      vz.addAssign(gravityUniform.z.mul(dtUniform));
    }

    // Boundary: zero velocities at grid edges
    const x = int(instanceIndex).div(int(gs * gs));
    const y = int(instanceIndex).div(int(gs)).mod(int(gs));
    const z = int(instanceIndex).mod(int(gs));

    if (boundaryMode === "sphere" || boundaryMode === "morphing_sphere") {
      // Sphere mode: only clamp at the very outermost cells to avoid
      // creating a visible boxy boundary inside the simulation volume
      If(x.lessThan(int(1)).or(x.greaterThan(int(gs).sub(int(2)))), () => {
        vx.assign(0);
      });
      If(y.lessThan(int(1)).or(y.greaterThan(int(gs).sub(int(2)))), () => {
        vy.assign(0);
      });
      If(z.lessThan(int(1)).or(z.greaterThan(int(gs).sub(int(2)))), () => {
        vz.assign(0);
      });
    } else {
      If(x.lessThan(int(2)).or(x.greaterThan(int(gs).sub(int(3)))), () => {
        vx.assign(0);
      });
      If(y.lessThan(int(2)).or(y.greaterThan(int(gs).sub(int(3)))), () => {
        vy.assign(0);
      });
      If(z.lessThan(int(2)).or(z.greaterThan(int(gs).sub(int(3)))), () => {
        vz.assign(0);
      });
    }

    cellBufferFloat.element(instanceIndex).assign(vec4(vx, vy, vz, mass));
  })()
    .compute(cellCount)
    .setName("updateGridKernel");

  // --- Kernel: G2P (grid to particle) with boundary-mode-specific clamping ---
  const g2pKernel: any = Fn(() => {
    If(instanceIndex.greaterThanEqual(particleCountUniform), () => {
      Return();
    });

    const particlePosition = particleBuffer
      .element(instanceIndex)
      .get("position")
      .toVar("particlePosition");
    const gridPosition = particlePosition.mul(gridSizeUniform).toVar();
    const particleVelocity = vec3(0).toVar("particleVelocity");

    const cellIdx = ivec3(gridPosition).sub(1).toConst("cellIndex");
    const cellDiff = gridPosition.fract().sub(0.5).toConst("cellDiff");
    const weights = computeWeights(cellDiff);

    const B = (mat3 as any)(0).toVar("B");
    Loop(
      { start: 0, end: 3, type: "int", name: "gx", condition: "<" } as any,
      ({ gx }: any) => {
        Loop(
          { start: 0, end: 3, type: "int", name: "gy", condition: "<" } as any,
          ({ gy }: any) => {
            Loop(
              {
                start: 0,
                end: 3,
                type: "int",
                name: "gz",
                condition: "<",
              } as any,
              ({ gz }: any) => {
                const weight = weights
                  .element(gx)
                  .x.mul(weights.element(gy).y)
                  .mul(weights.element(gz).z);
                const cellX = cellIdx.add((ivec3 as any)(gx, gy, gz)).toConst();
                const cellDist = (vec3 as any)(cellX)
                  .add(0.5)
                  .sub(gridPosition)
                  .toConst("cellDist");
                const cellPtr = gridIndex(cellX, gs, gs);
                const weightedVelocity = cellBufferFloat
                  .element(cellPtr)
                  .xyz.mul(weight)
                  .toConst("weightedVelocity");
                const term = (mat3 as any)(
                  weightedVelocity.mul(cellDist.x),
                  weightedVelocity.mul(cellDist.y),
                  weightedVelocity.mul(cellDist.z),
                );
                B.addAssign(term);
                particleVelocity.addAssign(weightedVelocity);
              },
            );
          },
        );
      },
    );

    particleBuffer.element(instanceIndex).get("C").assign(B.mul(4));

    // Scale velocity from grid space to normalized [0,1] space
    particleVelocity.divAssign(gridSizeUniform);

    // External force (audio-driven)
    particleVelocity.addAssign(externalForceUniform.mul(dtUniform));

    // Advect position
    particlePosition.addAssign(particleVelocity.mul(dtUniform));

    // Boundary-mode specific clamping
    if (boundaryMode === "box") {
      particlePosition.assign(
        clamp(particlePosition, boundaryMinUniform, boundaryMaxUniform),
      );
      const wallStiffness = float(0.8);
      const posNext = particlePosition
        .add(particleVelocity.mul(dtUniform).mul(2.0))
        .toConst("posNext");
      particleVelocity.addAssign(
        boundaryMinUniform.sub(posNext).max(0.0).mul(wallStiffness),
      );
      particleVelocity.addAssign(
        boundaryMaxUniform.sub(posNext).min(0.0).mul(wallStiffness),
      );
    } else if (boundaryMode === "cylinder") {
      // Z-up: clamp Z for floor/ceiling
      particlePosition.z.assign(
        clamp(particlePosition.z, boundaryMinUniform.z, boundaryMaxUniform.z),
      );

      // Radial clamp in XY around center (0.5, 0.5)
      const toCenter = vec3(
        particlePosition.x.sub(0.5),
        particlePosition.y.sub(0.5),
        0,
      ).toVar("toCenter");
      const radialDist = toCenter.length();
      const maxRadius = boundaryMaxUniform.x.sub(0.5);
      If(radialDist.greaterThan(maxRadius), () => {
        const correction = toCenter.normalize().mul(maxRadius);
        particlePosition.x.assign(float(0.5).add(correction.x));
        particlePosition.y.assign(float(0.5).add(correction.y));
      });

      // Floor/ceiling wall forces along Z
      const wallStiffness = float(0.8);
      const posNext = particlePosition
        .add(particleVelocity.mul(dtUniform).mul(2.0))
        .toVar("posNext");
      particleVelocity.z.addAssign(
        max(0.0, boundaryMinUniform.z.sub(posNext.z)).mul(wallStiffness),
      );
      particleVelocity.z.addAssign(
        max(0.0, posNext.z.sub(boundaryMaxUniform.z))
          .negate()
          .mul(wallStiffness),
      );
    } else if (boundaryMode === "morphing_sphere") {
      // Morphing sphere: inner boundary from per-direction radius map + radial gravity
      const center = vec3(0.5, 0.5, 0.5);
      const toParticle = particlePosition.sub(center).toVar("msToP");
      const dist = toParticle.length().toVar("msDist");

      const EPSILON = float(0.0001);
      const safeDist = max(dist, EPSILON);

      // Spherical coordinates from Cartesian offset
      const theta = (atan as any)(toParticle.y, toParticle.x); // [-PI, PI]
      const phi = acos(clamp(toParticle.z.div(safeDist), -1.0, 1.0)); // [0, PI]

      // Map to buffer indices (compute as float, then convert to int)
      const PI_VAL = float(Math.PI);
      const TWO_PI_VAL = float(Math.PI * 2);
      const thetaIdxF = clamp(
        floor(
          theta.add(PI_VAL).div(TWO_PI_VAL).mul(float(SPHERE_MAP_THETA_RES)),
        ),
        float(0),
        float(SPHERE_MAP_THETA_RES - 1),
      );
      const phiIdxF = clamp(
        floor((phi as any).div(PI_VAL).mul(float(SPHERE_MAP_PHI_RES))),
        float(0),
        float(SPHERE_MAP_PHI_RES - 1),
      );
      const mapIdx = (int(thetaIdxF) as any)
        .mul(int(SPHERE_MAP_PHI_RES))
        .add(int(phiIdxF));

      const innerRadius = radiusMapStorage.element(mapIdx).toVar("innerRadius");
      const shellThickness = float(0.16);
      const outerRadius = innerRadius.add(shellThickness);

      // Velocity damping to prevent oscillation
      particleVelocity.mulAssign(0.93);

      // Soft spring boundaries — strong enough to track the moving surface
      const dir = toParticle.div(safeDist).toConst("msDir");
      const springK = float(20.0);

      // Inner boundary: spring push outward
      If(dist.lessThan(innerRadius), () => {
        const penetration = innerRadius.sub(dist);
        particleVelocity.addAssign(dir.mul(penetration.mul(springK)));
      });

      // Outer boundary: spring push inward
      If(dist.greaterThan(outerRadius), () => {
        const penetration = dist.sub(outerRadius);
        particleVelocity.subAssign(dir.mul(penetration.mul(springK)));
      });

      // Radial gravity: pull toward center (gravityUniform.x = strength scalar)
      const gravStrength = gravityUniform.x;
      If(dist.greaterThan(EPSILON), () => {
        const gravDir = toParticle.div(safeDist).negate();
        particleVelocity.addAssign(gravDir.mul(gravStrength.mul(dtUniform)));
      });
    } else {
      // Sphere: hard radial containment around (0.5, 0.5, 0.5)
      const center = vec3(0.5, 0.5, 0.5);
      const toParticle = particlePosition.sub(center).toVar("toParticle");
      const dist = toParticle.length().toVar("dist");
      const sphereRadius = boundaryMaxUniform.x.sub(0.5);

      If(dist.greaterThan(sphereRadius), () => {
        const dir = toParticle.normalize().toConst("dir");
        particlePosition.assign(center.add(dir.mul(sphereRadius)));

        const outwardSpeed = particleVelocity.dot(dir);
        If(outwardSpeed.greaterThan(0), () => {
          particleVelocity.subAssign(dir.mul(outwardSpeed.mul(1.2)));
        });
      });
    }

    // Scale velocity back to grid space
    particleVelocity.mulAssign(gridSizeUniform);

    particleBuffer
      .element(instanceIndex)
      .get("position")
      .assign(particlePosition);
    particleBuffer
      .element(instanceIndex)
      .get("velocity")
      .assign(particleVelocity);
  })()
    .compute(config.initialParticleCount, [WORKGROUP_SIZE, 1, 1] as any)
    .setName("g2pKernel");

  // --- Assemble ---
  const setParticleCount = (count: number, mesh: Mesh) => {
    particleCountUniform.value = count;
    mesh.count = count;
  };

  const step = (renderer: WebGPURenderer) => {
    void renderer.compute(workgroupKernel);
    void renderer.compute(clearGridKernel);
    void renderer.compute(p2g1Kernel, p2g1Wg);
    void renderer.compute(p2g2Kernel, p2g2Wg);
    void renderer.compute(updateGridKernel);
    void renderer.compute(g2pKernel, g2pWg);
  };

  return {
    uniforms,
    particleBuffer,
    kernels: {
      workgroup: workgroupKernel,
      clearGrid: clearGridKernel,
      p2g1: p2g1Kernel,
      p2g2: p2g2Kernel,
      updateGrid: updateGridKernel,
      g2p: g2pKernel,
    },
    workgroupBuffers: { p2g1: p2g1Wg, p2g2: p2g2Wg, g2p: g2pWg },
    config,
    setParticleCount,
    step,
    ...(radiusMapArray && radiusMapAttr
      ? { radiusMap: { array: radiusMapArray, attribute: radiusMapAttr } }
      : {}),
  };
}
