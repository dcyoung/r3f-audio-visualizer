import { type ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";
import { type IMotionMapper } from "@/lib/mappers/motionMappers/common";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";
import { type ColorPaletteType } from "@/lib/palettes";

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
