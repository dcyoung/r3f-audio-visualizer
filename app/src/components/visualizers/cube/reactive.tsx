import { type ComponentPropsWithoutRef } from "react";
import Ground from "@/components/visualizers/ground";
import {
  type TOmitVisualProps,
  type TVisualProps,
} from "@/components/visualizers/models";
import { Vector3 } from "three";

import { createVisualConfigStore } from "../storeHelpers";
import BaseVisual from "./base";

export type TConfig = Required<
  TOmitVisualProps<ComponentPropsWithoutRef<typeof BaseVisual>>
>;

export const { useVisualParams, useActions, usePresets } =
  createVisualConfigStore<TConfig>({
    default: {
      nPerSide: 10,
      cubeSideLength: 0.5,
      cubeSpacingScalar: 0.1,
      volume: true,
    },
  });

const CubeVisual = ({ coordinateMapper }: TVisualProps) => {
  const params = useVisualParams();

  return (
    <>
      <BaseVisual coordinateMapper={coordinateMapper} {...params} />
      <Ground
        position={
          new Vector3(
            0,
            0,
            -0.75 *
              params.nPerSide *
              (1 + params.cubeSpacingScalar) *
              params.cubeSideLength,
          )
        }
      />
    </>
  );
};

export default CubeVisual;
