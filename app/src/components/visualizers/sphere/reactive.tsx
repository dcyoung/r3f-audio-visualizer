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
    radius: 2,
    nPoints: 800,
    cubeSideLength: 0.05,
  },
);

export default ({ coordinateMapper }: VisualProps) => {
  const params = useVisualParams();
  return (
    <>
      <BaseVisual coordinateMapper={coordinateMapper} {...params} />
      <Ground
        position={
          new Vector3(
            0,
            0,
            -params.radius * (1 + 0.25 * coordinateMapper.amplitude),
          )
        }
      />
    </>
  );
};
