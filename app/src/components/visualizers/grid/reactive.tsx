import { type ComponentPropsWithoutRef } from "react";
import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { Vector3 } from "three";

import { createVisualConfigStore } from "../storeHelpers";
import BaseVisual from "./base";

export type TConfig = Required<
  Omit<ComponentPropsWithoutRef<typeof BaseVisual>, "coordinateMapper">
>;

export const { useVisualParams, useActions } = createVisualConfigStore<TConfig>(
  {
    nGridCols: 100,
    nGridRows: 100,
    cubeSideLength: 0.025,
    cubeSpacingScalar: 5,
  },
);

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
