import { folder, useControls } from "leva";
import BaseDoubleHelix from "./base";
import { VisualProps } from "../common";
import MultiStrand from "./multi";

const DNAVisual = ({ coordinateMapper }: VisualProps): JSX.Element => {
  const {
    multi,
    helixLength,
    helixRadius,
    helixWindingSeparation,
    strandRadius,
    baseSpacing,
    strandOffsetRad,
    mirrorEffects,
    fixedBaseGap,
  } = useControls({
    "Visual - DNA": folder(
      {
        multi: true,
        helixLength: { value: 15, min: 5, max: 100, step: 5 },
        helixRadius: { value: 1, min: 1, max: 5, step: 1 },
        helixWindingSeparation: { value: 10, min: 5, max: 50, step: 1 },
        strandRadius: { value: 0.1, min: 0.1, max: 0.3, step: 0.1 },
        baseSpacing: { value: 0.35, min: 0.1, max: 2.0, step: 0.05 },
        strandOffsetRad: {
          value: Math.PI / 2,
          min: Math.PI / 4,
          max: Math.PI,
          step: Math.PI / 8,
        },
        mirrorEffects: true,
        fixedBaseGap: false,
      },
      { collapsed: true }
    ),
  });

  return multi ? (
    <MultiStrand
      coordinateMapper={coordinateMapper}
      helixLength={helixLength}
      helixRadius={helixRadius}
      helixWindingSeparation={helixWindingSeparation}
      strandRadius={strandRadius}
      baseSpacing={baseSpacing}
      strandOffsetRad={strandOffsetRad}
      mirrorEffects={mirrorEffects}
      fixedBaseGap={fixedBaseGap}
    />
  ) : (
    <BaseDoubleHelix
      coordinateMapper={coordinateMapper}
      helixLength={helixLength}
      helixRadius={helixRadius}
      helixWindingSeparation={helixWindingSeparation}
      strandRadius={strandRadius}
      baseSpacing={baseSpacing}
      strandOffsetRad={strandOffsetRad}
      mirrorEffects={mirrorEffects}
      fixedBaseGap={fixedBaseGap}
    />
  );
};

export default DNAVisual;
