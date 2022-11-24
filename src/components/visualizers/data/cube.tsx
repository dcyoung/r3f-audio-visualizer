import { folder, useControls } from "leva";
import { MutableRefObject } from "react";
import BaseCube from "../baseCube";
import { interpolateValueForNormalizedCoord } from "../utils";

interface DataReactiveCubeProps {
  dataRef: MutableRefObject<number[]>;
  amplitude?: number;
}

const DataReactiveCube = ({
  dataRef,
  amplitude = 1.0,
}: DataReactiveCubeProps): JSX.Element => {
  const { faceOnly } = useControls({
    Visual: folder(
      {
        faceOnly: false,
      },
      { collapsed: true }
    ),
  });
  const normQuadrantHypotenuse2D = Math.hypot(0.5, 0.5);
  const normQuadrantHypotenuse3D = Math.hypot(0.5, 0.5, 0.5);

  const getValueForNormalizedCoord = (
    normCubeX: number,
    normCubeY: number,
    normCubeZ: number
  ): number => {
    let normRadialOffset = 1;
    if (faceOnly) {
      // calculate a radial offset for each face
      // (ie: treat each face as a grid and calculate radial dist from center of grid)
      // Exterior:
      if (normCubeX == 0 || normCubeX == 1) {
        normRadialOffset =
          Math.hypot(normCubeY - 0.5, normCubeZ - 0.5) /
          normQuadrantHypotenuse2D;
      } else if (normCubeY == 0 || normCubeY == 1) {
        normRadialOffset =
          Math.hypot(normCubeX - 0.5, normCubeZ - 0.5) /
          normQuadrantHypotenuse2D;
      } else if (normCubeZ == 0 || normCubeZ == 1) {
        normRadialOffset =
          Math.hypot(normCubeX - 0.5, normCubeY - 0.5) /
          normQuadrantHypotenuse2D;
      } else {
        // interior
        return 1;
      }
    } else {
      normRadialOffset =
        Math.hypot(normCubeX - 0.5, normCubeY - 0.5, normCubeZ - 0.5) /
        normQuadrantHypotenuse3D;
    }
    return (
      amplitude *
      interpolateValueForNormalizedCoord(dataRef?.current, normRadialOffset)
    );
  };

  return (
    <BaseCube
      getValueForNormalizedCoord={getValueForNormalizedCoord}
    ></BaseCube>
  );
};

export default DataReactiveCube;
