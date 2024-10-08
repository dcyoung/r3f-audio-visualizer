import { type ComponentPropsWithoutRef } from "react";
import Ground from "@/components/visualizers/ground";
import { Vector3 } from "three";

import { type TOmitVisualProps, type TVisualProps } from "../models";
import { createVisualConfigStore } from "../storeHelpers";
import BaseVisual from "./base";

export type TConfig = Required<
  TOmitVisualProps<ComponentPropsWithoutRef<typeof BaseVisual>>
>;

export const { useVisualParams, useActions, usePresets } =
  createVisualConfigStore<TConfig>({
    default: {
      maxPoints: 1000,
      pointSize: 0.2,
      maxDim: 2,
      color: "white",
    },
  });

const SwarmVisual = ({ motionMapper }: TVisualProps) => {
  const params = useVisualParams();
  // const { maxDim, pointSize } = useControls({
  //   Particles: folder(
  //     {
  //       maxDim: { value: 10, min: 0.25, max: 10, step: 0.25 },
  //       pointSize: { value: 0.2, min: 0.01, max: 2, step: 0.01 },
  //     },
  //     { collapsed: true }
  //   ),
  // });

  return (
    <>
      <BaseVisual motionMapper={motionMapper} {...params} />
      <Ground position={new Vector3(0, 0, -1.5 * params.maxDim)} />
    </>
  );
};

export default SwarmVisual;
