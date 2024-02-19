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

export const VISUAL = {
  GRID: "grid",
  SPHERE: "sphere",
  CUBE: "cube",
  DIFFUSED_RING: "diffusedRing",
  DNA: "dna",
  BOXES: "boxes",
  RIBBONS: "ribbons",
  WALK: "walk",
  // STENCIL: "stencil",
  // SWARM: "swarm",
} as const;

export const AVAILABLE_VISUALS = Object.values(VISUAL);
export type VisualType = (typeof VISUAL)[keyof typeof VISUAL];
