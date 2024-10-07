import { type ComponentPropsWithoutRef } from "react";
import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { Vector3 } from "three";

import { createVisualConfigStore } from "../storeHelpers";
import BaseVisual from "./base";

export type TConfig = Required<
  Omit<ComponentPropsWithoutRef<typeof BaseVisual>, "coordinateMapper">
>;

export const { useVisualParams, useActions } = createVisualConfigStore<TConfig>(
  {
    radius: 2,
    nPoints: 1000,
    pointSize: 0.2,
    mirrorEffects: false,
  },
);

const DiffusedRingVisual = ({ coordinateMapper }: VisualProps) => {
  const params = useVisualParams();

  return (
    <>
      <BaseVisual coordinateMapper={coordinateMapper} {...params} />
      <Ground position={new Vector3(0, 0, -1.5 * coordinateMapper.amplitude)} />
    </>
  );
};

const ComposeDiffusedRingVisual = (props: VisualProps) => {
  return (
    <>
      <DiffusedRingVisual {...props} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={1} height={300} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </>
  );
};

export default ComposeDiffusedRingVisual;
