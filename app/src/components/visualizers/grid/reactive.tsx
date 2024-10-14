import { type ComponentPropsWithoutRef } from "react";
import Ground from "@/components/visualizers/ground";
import {
  type TOmitVisualProps,
  type TVisualProps,
} from "@/components/visualizers/models";
import { createConfigStore } from "@/lib/storeHelpers";
import { Vector3 } from "three";

import BaseVisual from "./base";

export type TConfig = Required<
  TOmitVisualProps<ComponentPropsWithoutRef<typeof BaseVisual>>
>;

export const { useParams, useActions, usePresets } = createConfigStore<TConfig>(
  {
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
  },
);

const GridVisual = ({ coordinateMapper }: TVisualProps) => {
  const params = useParams();
  return (
    <>
      <BaseVisual coordinateMapper={coordinateMapper} {...params} />
      <Ground position={new Vector3(0, 0, -2.5 * coordinateMapper.amplitude)} />
    </>
  );
};

export default GridVisual;
