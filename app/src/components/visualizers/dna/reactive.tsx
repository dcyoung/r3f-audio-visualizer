import { TSLBloomPostProcessing } from "@/components/canvas/webgpu/TSLPostProcessing";
import {
  type TOmitVisualProps,
  type TVisualProps,
} from "@/components/visualizers/models";
import { createConfigStore } from "@/lib/storeHelpers";

import {
  BaseDoubleHelix,
  MultiStrand,
  type BaseDoubleHelixProps,
} from "./base";

export type TConfig = Required<TOmitVisualProps<BaseDoubleHelixProps>> & {
  multi: boolean;
};

export const { useParams, useActions } = createConfigStore<TConfig>({
  default: {
    multi: true,
    helixLength: 50,
    helixRadius: 1,
    helixWindingSeparation: 10,
    strandRadius: 0.1,
    baseSpacing: 0.35,
    strandOffsetRad: Math.PI / 2,
    mirrorEffects: true,
    fixedBaseGap: false,
  },
});

const DNAVisual = ({ coordinateMapper }: TVisualProps) => {
  const { multi, ...params } = useParams();

  return multi ? (
    <MultiStrand coordinateMapper={coordinateMapper} {...params} />
  ) : (
    <BaseDoubleHelix coordinateMapper={coordinateMapper} {...params} />
  );
};

export default (props: TVisualProps) => {
  return (
    <>
      <DNAVisual {...props} />
      <TSLBloomPostProcessing
        bloomStrength={0.9}
        bloomRadius={0.4}
        bloomThreshold={0}
        noiseIntensity={0.02}
        vignetteOffset={0.1}
        vignetteDarkness={1.1}
      />
    </>
  );
};
