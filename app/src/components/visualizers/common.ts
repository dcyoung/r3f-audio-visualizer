import { type ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";
import { type IMotionMapper } from "@/lib/mappers/motionMappers/common";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";

export interface VisualProps {
  coordinateMapper: ICoordinateMapper;
  scalarTracker?: IScalarTracker;
}

export interface MotionVisualProps {
  motionMapper: IMotionMapper;
  scalarTracker?: IScalarTracker;
}


export const AVAILABLE_VISUALS = [
  "grid",
  "sphere",
  "cube",
  "diffusedRing",
  "dna",
  // "stencil",
  // "swarm",
] as const;

export type VisualType = (typeof AVAILABLE_VISUALS)[number]