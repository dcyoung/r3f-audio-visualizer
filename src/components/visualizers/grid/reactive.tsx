import { folder, useControls } from "leva";
import { useEffect } from "react";
import { Vector3 } from "three";
import { ECoordinateType } from "../../coordinateMapper";
import Ground from "../../ground";
import { useAppState } from "../../appState";
import BaseGrid from "./base";

interface GridVisualProps {}

const GridVisual = ({}: GridVisualProps): JSX.Element => {
  const { nGridRows, nGridCols, gridUnitSideLength, gridUnitSpacingScalar } =
    useControls({
      Grid: folder(
        {
          nGridRows: {
            value: 100,
            min: 2,
            max: 500,
            step: 1,
          },
          nGridCols: {
            value: 100,
            min: 2,
            max: 500,
            step: 1,
          },
          gridUnitSideLength: {
            value: 0.025,
            min: 0.01,
            max: 0.5,
            step: 0.005,
          },
          gridUnitSpacingScalar: {
            value: 5,
            min: 1,
            max: 10,
            step: 0.5,
          },
        },
        { collapsed: true }
      ),
    });
  const amplitude = useAppState((state) => state.amplitude);
  const updateCoordinateType = useAppState(
    (state) => state.updateCoordinateType
  );

  useEffect(() => {
    updateCoordinateType(ECoordinateType.Cartesian_2D);
  }, []);

  return (
    <>
      <BaseGrid
        nGridRows={nGridRows}
        nGridCols={nGridCols}
        cubeSideLength={gridUnitSideLength}
        cubeSpacingScalar={gridUnitSpacingScalar}
      />
      <Ground position={new Vector3(0, 0, -2.5 * amplitude)} />
    </>
  );
};

export default GridVisual;
