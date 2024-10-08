import { type ComponentPropsWithoutRef } from "react";
import Ground from "@/components/visualizers/ground";
import { type VisualProps } from "@/components/visualizers/models";
import { Vector3 } from "three";

import { createVisualConfigStore } from "../storeHelpers";
import BaseVisual from "./base";

export type TConfig = Required<
  Omit<ComponentPropsWithoutRef<typeof BaseVisual>, "coordinateMapper">
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

const CubeVisual = ({ coordinateMapper }: VisualProps) => {
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
