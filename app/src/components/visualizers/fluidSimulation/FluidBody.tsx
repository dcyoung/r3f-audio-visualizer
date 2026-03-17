import { type Vector3 } from "three";

import type { SimulationInstance } from "./simulation";
import type { BoundaryMode } from "./types";
import { useFluidSimulation } from "./useFluidSimulation";

export interface FluidBodyProps {
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
  initialFillRegion?: { min: Vector3; max: Vector3 };
  onBeforeStep?: (sim: SimulationInstance, dt: number) => void;
}

const FluidBody = (props: FluidBodyProps) => {
  useFluidSimulation(props);
  // The mesh is added to the scene imperatively by the hook.
  // This component exists as a declarative wrapper for R3F trees.
  return null;
};

export default FluidBody;
