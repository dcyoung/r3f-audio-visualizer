import { type ComponentPropsWithoutRef } from "react";
import { TSLBloomPostProcessing } from "@/components/canvas/webgpu/TSLPostProcessing";
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
      nPoints: 1000,
      pointSize: 0.12,
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
      <TSLBloomPostProcessing
        bloomStrength={1.0}
        bloomRadius={0.5}
        bloomThreshold={0.3}
        noiseIntensity={0.05}
      />
    </>
  );
};
