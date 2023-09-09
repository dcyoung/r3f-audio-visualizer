import { type ColorPaletteType } from "./palettes";
import { type ICoordinateMapper } from "../mappers/coordinateMappers/common";
import { type IMotionMapper } from "../mappers/motionMappers/common";
import { type IScalarTracker } from "../mappers/valueTracker/common";

export interface VisualProps {
  coordinateMapper: ICoordinateMapper;
  scalarTracker: IScalarTracker;
  palette?: ColorPaletteType;
}

export interface MotionVisualProps {
  motionMapper: IMotionMapper;
  scalarTracker?: IScalarTracker;
  palette?: ColorPaletteType;
}
