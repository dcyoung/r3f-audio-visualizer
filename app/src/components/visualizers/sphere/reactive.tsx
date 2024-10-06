import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { Vector3 } from "three";

import BaseSphere from "./base";
import { useSphereVisualConfigContext } from "./config";

const SphereVisual = ({ coordinateMapper }: VisualProps) => {
  const { radius, nPoints, unitSideLength } = useSphereVisualConfigContext();

  return (
    <>
      <BaseSphere
        coordinateMapper={coordinateMapper}
        radius={radius}
        nPoints={nPoints}
        cubeSideLength={unitSideLength}
      />
      <Ground
        position={
          new Vector3(0, 0, -radius * (1 + 0.25 * coordinateMapper.amplitude))
        }
      />
    </>
  );
};

export default SphereVisual;
