import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { useCubeVisualConfigContext } from "@/context/visualConfig/cube";
import { Vector3 } from "three";

import BaseCube from "./base";

const CubeVisual = ({ coordinateMapper }: VisualProps) => {
  const { nPerSide, unitSideLength, unitSpacingScalar, volume } =
    useCubeVisualConfigContext();

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
            -0.75 * nPerSide * (1 + unitSpacingScalar) * unitSideLength,
          )
        }
      />
    </>
  );
};

export default CubeVisual;
