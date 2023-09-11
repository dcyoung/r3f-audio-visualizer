import { Vector3 } from "three";

import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { useGridVisualConfigContext } from "@/context/visualConfig/grid";
import { COLOR_PALETTE } from "@/lib/palettes";

import BaseGrid from "./base";

const GridVisual = ({
  coordinateMapper,
  palette = COLOR_PALETTE.THREE_COOL_TO_WARM,
}: VisualProps) => {
  const { nRows, nCols, unitSideLength, unitSpacingScalar } =
    useGridVisualConfigContext();
  return (
    <>
      <BaseGrid
        coordinateMapper={coordinateMapper}
        nGridRows={nRows}
        nGridCols={nCols}
        cubeSideLength={unitSideLength}
        cubeSpacingScalar={unitSpacingScalar}
        palette={palette}
      />
      <Ground position={new Vector3(0, 0, -2.5 * coordinateMapper.amplitude)} />
    </>
  );
};

export default GridVisual;
