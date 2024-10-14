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
      radius: 2,
      nPoints: 800,
      cubeSideLength: 0.05,
    },
  },
);

export default ({ coordinateMapper }: TVisualProps) => {
  const params = useParams();
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
