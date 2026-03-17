import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { type Mesh, type WebGPURenderer } from "three/webgpu";

import { createParticleMesh } from "./rendering";
import { createFluidSimulation, type SimulationInstance } from "./simulation";
import type { BoundaryMode, FluidSimulationConfig } from "./types";
import { DEFAULT_FLUID_CONFIG } from "./types";

export interface UseFluidSimulationOptions {
  boundaryMode: BoundaryMode;
  particleCount?: number;
  gridSize?: number;
  maxParticles?: number;
  stiffness?: number;
  restDensity?: number;
  dynamicViscosity?: number;
  gravity?: Vector3;
  color?: string;
  particleRadius?: number;
  initialFillRegion?: {
    min: Vector3;
    max: Vector3;
  };
  /** Called each frame before compute dispatch. Use to update uniforms from audio data. */
  onBeforeStep?: (sim: SimulationInstance, deltaTime: number) => void;
}

const DEFAULT_GRAVITY = new Vector3(0, 0, -(9.81 * 9.81));
const DEFAULT_FILL_REGION = {
  min: new Vector3(0.1, 0.1, 0.1),
  max: new Vector3(0.9, 0.9, 0.5),
};

export function useFluidSimulation(options: UseFluidSimulationOptions) {
  const {
    boundaryMode,
    particleCount = DEFAULT_FLUID_CONFIG.initialParticleCount,
    gridSize = DEFAULT_FLUID_CONFIG.gridSize,
    maxParticles = DEFAULT_FLUID_CONFIG.maxParticles,
    stiffness = DEFAULT_FLUID_CONFIG.stiffness,
    restDensity = DEFAULT_FLUID_CONFIG.restDensity,
    dynamicViscosity = DEFAULT_FLUID_CONFIG.dynamicViscosity,
    gravity = DEFAULT_GRAVITY,
    color = "#0088FF",
    particleRadius = 0.012,
    initialFillRegion = DEFAULT_FILL_REGION,
    onBeforeStep,
  } = options;

  const simRef = useRef<SimulationInstance | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const scene = useThree((s) => s.scene);

  const onBeforeStepRef = useRef(onBeforeStep);
  onBeforeStepRef.current = onBeforeStep;

  // Structural params: full recreation required
  useEffect(() => {
    const config: FluidSimulationConfig = {
      maxParticles,
      gridSize,
      initialParticleCount: particleCount,
      stiffness,
      restDensity,
      dynamicViscosity,
      gravity: gravity.clone(),
      initialFillRegion,
    };

    const sim = createFluidSimulation(config, boundaryMode);
    const mesh = createParticleMesh(sim, color, particleRadius);

    simRef.current = sim;
    meshRef.current = mesh;
    scene.add(mesh);

    return () => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
      simRef.current = null;
      meshRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    boundaryMode,
    particleCount,
    gridSize,
    maxParticles,
    initialFillRegion,
    color,
    particleRadius,
    scene,
  ]);

  // Physics params: hot-update uniforms without resetting the simulation
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    (sim.uniforms.stiffness as { value: number }).value = stiffness;
    (sim.uniforms.restDensity as { value: number }).value = restDensity;
    (sim.uniforms.dynamicViscosity as { value: number }).value =
      dynamicViscosity;
    (sim.uniforms.gravity as { value: Vector3 }).value.copy(gravity);
  }, [stiffness, restDensity, dynamicViscosity, gravity]);

  useFrame(({ gl }) => {
    const sim = simRef.current;
    if (!sim) return;

    const dt = MathUtils.clamp(1 / 60, 0.00001, 1 / 30);
    (sim.uniforms.dt as { value: number }).value = dt;

    onBeforeStepRef.current?.(sim, dt);

    const typedSim = sim as { step: (r: WebGPURenderer) => void };
    typedSim.step(gl as unknown as WebGPURenderer);
  });

  return { simRef, meshRef };
}
