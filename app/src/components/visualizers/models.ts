import { type ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";
import { type IMotionMapper } from "@/lib/mappers/motionMappers/common";
import { type TextureMapper } from "@/lib/mappers/textureMappers/textureMapper";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";

export type TVisualProps = {
  coordinateMapper: ICoordinateMapper;
  scalarTracker?: IScalarTracker;
  textureMapper: TextureMapper;
  motionMapper: IMotionMapper;
};

export type TOmitVisualProps<T> = Omit<T, keyof TVisualProps>;
