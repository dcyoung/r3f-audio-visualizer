import { ICoordinateMapper } from "../coordinateMappers/common";
import { IMotionMapper } from "../motionMappers/common";

export interface VisualProps {
  coordinateMapper: ICoordinateMapper;
}

export interface MotionVisualProps {
  motionMapper: IMotionMapper;
}
