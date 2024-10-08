import { type ComponentPropsWithoutRef } from "react";
import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { Vector3 } from "three";

import { createVisualConfigStore } from "../storeHelpers";
import BaseVisual from "./base";

export type TConfig = Required<
  Omit<ComponentPropsWithoutRef<typeof BaseVisual>, "coordinateMapper">
>;

export const { useVisualParams, useActions, usePresets } =
  createVisualConfigStore<TConfig>({
    default: {
      nGridCols: 100,
      nGridRows: 100,
      cubeSideLength: 0.025,
      cubeSpacingScalar: 5,
    },
    bands: {
      nGridRows: 5,
      nGridCols: 200,
      cubeSideLength: 0.025,
      cubeSpacingScalar: 1,
    },
  });

const GridVisual = ({ coordinateMapper }: VisualProps) => {
  const params = useVisualParams();
  return (
    <>
      <BaseVisual coordinateMapper={coordinateMapper} {...params} />
      <Ground position={new Vector3(0, 0, -2.5 * coordinateMapper.amplitude)} />
    </>
  );
};

export default GridVisual;
