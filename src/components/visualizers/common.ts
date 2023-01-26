import { ICoordinateMapper } from "../coordinateMappers/common";
import { IMotionMapper } from "../motionMappers/common";
import { IScalarTracker } from "../valueTracker/common";

export interface VisualProps {
  coordinateMapper: ICoordinateMapper;
  scalarTracker: IScalarTracker;
}

export interface MotionVisualProps {
  motionMapper: IMotionMapper;
  scalarTracker?: IScalarTracker;
}
