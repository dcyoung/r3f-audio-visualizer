import { Vector3 } from "three";

import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { useGridVisualConfigContext } from "@/context/visualConfig/grid";

import BaseGrid from "./base";

const GridVisual = ({ coordinateMapper }: VisualProps) => {
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
      />
      <Ground position={new Vector3(0, 0, -2.5 * coordinateMapper.amplitude)} />
    </>
  );
};

export default GridVisual;
