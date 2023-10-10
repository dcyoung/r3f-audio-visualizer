import { Vector3 } from "three";

import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { useCubeVisualConfigContext } from "@/context/visualConfig/cube";

import BaseCube from "./base";

const CubeVisual = ({ coordinateMapper }: VisualProps) => {
  const { nPerSide, unitSideLength, unitSpacingScalar, volume } =
    useCubeVisualConfigContext();
  // const { nPerSide, cubeUnitSideLength, cubeUnitSpacingScalar, volume } =
  //   useControls({
  //     "Visual - Cube": folder(
  //       {
  //         nPerSide: {
  //           value: 10,
  //           min: 3,
  //           max: 50,
  //           step: 1,
  //         },
  //         cubeUnitSideLength: {
  //           value: 0.5,
  //           min: 0.1,
  //           max: 2.0,
  //           step: 0.05,
  //         },
  //         cubeUnitSpacingScalar: {
  //           value: 0.1,
  //           min: 0,
  //           max: 2,
  //           step: 0.1,
  //         },
  //         volume: true,
  //       },
  //       { collapsed: true }
  //     ),
  //   });

  return (
    <>
      <BaseCube
        coordinateMapper={coordinateMapper}
        nPerSide={nPerSide}
        cubeSideLength={unitSideLength}
        cubeSpacingScalar={unitSpacingScalar}
        volume={volume}
      />
      <Ground
        position={
          new Vector3(
            0,
            0,
            -0.75 * nPerSide * (1 + unitSpacingScalar) * unitSideLength
          )
        }
      />
    </>
  );
};

export default CubeVisual;
