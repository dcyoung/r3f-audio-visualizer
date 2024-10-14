import { type ComponentPropsWithoutRef } from "react";
import Ground from "@/components/visualizers/ground";
import {
  type TOmitVisualProps,
  type TVisualProps,
} from "@/components/visualizers/models";
import { createConfigStore } from "@/lib/storeHelpers";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { Vector3 } from "three";

import BaseVisual from "./base";

export type TConfig = Required<
  TOmitVisualProps<ComponentPropsWithoutRef<typeof BaseVisual>>
>;

export const { useParams, useActions, usePresets } = createConfigStore<TConfig>(
  {
    default: {
      radius: 2,
      nPoints: 1000,
      pointSize: 0.2,
      mirrorEffects: false,
    },
  },
);

const DiffusedRingVisual = ({ coordinateMapper }: TVisualProps) => {
  const params = useParams();

  return (
    <>
      <BaseVisual coordinateMapper={coordinateMapper} {...params} />
      <Ground position={new Vector3(0, 0, -1.5 * coordinateMapper.amplitude)} />
    </>
  );
};

export default (props: TVisualProps) => {
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
