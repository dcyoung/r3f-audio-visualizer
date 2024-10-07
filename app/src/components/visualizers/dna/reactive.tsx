import { type VisualProps } from "@/components/visualizers/common";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

import { createVisualConfigStore } from "../storeHelpers";
import BaseDoubleHelix, { type BaseDoubleHelixProps } from "./base";
import MultiStrand from "./multi";

export type TConfig = { multi: boolean } & Required<
  Omit<BaseDoubleHelixProps, "coordinateMapper">
>;

export const { useVisualParams, useActions } = createVisualConfigStore<TConfig>(
  {
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
);

const DNAVisual = ({ coordinateMapper }: VisualProps) => {
  const { multi, ...params } = useVisualParams();
  // const {
  //   multi,
  //   helixLength,
  //   helixRadius,
  //   helixWindingSeparation,
  //   strandRadius,
  //   baseSpacing,
  //   strandOffsetRad,
  //   mirrorEffects,
  //   fixedBaseGap,
  // } = useControls({
  //   "Visual - DNA": folder(
  //     {
  //       multi: true,
  //       helixLength: { value: 50, min: 5, max: 100, step: 5 },
  //       helixRadius: { value: 1, min: 1, max: 5, step: 1 },
  //       helixWindingSeparation: { value: 10, min: 5, max: 50, step: 1 },
  //       strandRadius: { value: 0.1, min: 0.1, max: 0.3, step: 0.1 },
  //       baseSpacing: { value: 0.35, min: 0.1, max: 2.0, step: 0.05 },
  //       strandOffsetRad: {
  //         value: Math.PI / 2,
  //         min: Math.PI / 4,
  //         max: Math.PI,
  //         step: Math.PI / 8,
  //       },
  //       mirrorEffects: true,
  //       fixedBaseGap: false,
  //     },
  //     { collapsed: true }
  //   ),
  // });

  return multi ? (
    <MultiStrand coordinateMapper={coordinateMapper} {...params} />
  ) : (
    <BaseDoubleHelix coordinateMapper={coordinateMapper} {...params} />
  );
};

const ComposedDNAVisual = (props: VisualProps) => {
  return (
    <>
      <DNAVisual {...props} />
      <EffectComposer>
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={3}
          height={480}
        />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default ComposedDNAVisual;
