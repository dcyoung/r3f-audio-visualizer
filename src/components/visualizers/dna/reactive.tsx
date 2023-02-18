import { folder, useControls } from "leva";
import BaseDoubleHelix from "./base";
import { VisualProps } from "../common";

const DNAVisual = ({ coordinateMapper }: VisualProps): JSX.Element => {
  const {
    helixLength,
    helixRadius,
    helixWindingSeparation,
    strandRadius,
    baseSpacing,
  } = useControls({
    "Visual - DNA": folder(
      {
        helixLength: { value: 20, min: 10, max: 100, step: 5 },
        helixRadius: { value: 1, min: 1, max: 5, step: 1 },
        helixWindingSeparation: { value: 5, min: 2, max: 50, step: 1 },
        strandRadius: { value: 0.1, min: 0.1, max: 1, step: 0.1 },
        baseSpacing: { value: 1.0, min: 0.1, max: 2.0, step: 0.1 },
      },
      { collapsed: true }
    ),
  });

  return (
    <>
      <BaseDoubleHelix
        coordinateMapper={coordinateMapper}
        // helixLength={helixLength}
        // helixRadius={helixRadius}
        // helixWindingSeparation={helixWindingSeparation}
        // strandRadius={strandRadius}
        // baseSpacing={baseSpacing}
      />
    </>
  );
};

export default DNAVisual;
