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
