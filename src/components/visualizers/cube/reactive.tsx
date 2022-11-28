import { folder, useControls } from "leva";
import { useEffect } from "react";
import { Vector3 } from "three";
import { ECoordinateType } from "../../coordinateMapper";
import Ground from "../../ground";
import { useAppState } from "../../appState";
import BaseCube from "./base";

interface CubeVisualProps {}

const CubeVisual = ({}: CubeVisualProps): JSX.Element => {
  const coordinateMapper = useAppState((state) => state.coordinateMapper);
  const updateCoordinateType = useAppState(
    (state) => state.updateCoordinateType
  );

  const { nPerSide, cubeUnitSideLength, cubeUnitSpacingScalar, volume } =
    useControls({
      Cube: folder(
        {
          nPerSide: {
            value: 10,
            min: 3,
            max: 50,
            step: 1,
          },
          cubeUnitSideLength: {
            value: 0.5,
            min: 0.1,
            max: 2.0,
            step: 0.05,
          },
          cubeUnitSpacingScalar: {
            value: 0.1,
            min: 0,
            max: 2,
            step: 0.1,
          },
          volume: true,
        },
        { collapsed: true }
      ),
    });

  useEffect(() => {
    updateCoordinateType(
      volume
        ? ECoordinateType.Cartesian_3D
        : ECoordinateType.Cartesian_CubeFaces
    );
  }, [volume]);

  return (
    <>
      <BaseCube
        coordinateMapper={coordinateMapper}
        nPerSide={nPerSide}
        cubeSideLength={cubeUnitSideLength}
        cubeSpacingScalar={cubeUnitSpacingScalar}
      />
      <Ground
        position={
          new Vector3(
            0,
            0,
            -0.75 * nPerSide * (1 + cubeUnitSpacingScalar) * cubeUnitSideLength
          )
        }
      />
    </>
  );
};

export default CubeVisual;
