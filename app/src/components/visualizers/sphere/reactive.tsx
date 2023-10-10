import { Vector3 } from "three";

import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { useSphereVisualConfigContext } from "@/context/visualConfig/sphere";

import BaseSphere from "./base";

const SphereVisual = ({ coordinateMapper }: VisualProps) => {
  const { radius, nPoints, unitSideLength } = useSphereVisualConfigContext();
  // const {
  //   radius,
  //   nPoints,
  //   cubeSideLength,
  //   // mapMode
  // } = useControls({
  //   "Visual - Sphere": folder(
  //     {
  //       radius: { value: 2, min: 0.25, max: 3, step: 0.25 },
  //       nPoints: { value: 800, min: 100, max: 2000, step: 25 },
  //       cubeSideLength: {
  //         value: 0.05,
  //         min: 0.01,
  //         max: 0.5,
  //         step: 0.005,
  //       },
  //       // mapMode: {
  //       //   value: MAPPING_MODE_POLAR_2D,
  //       //   options: [
  //       //     MAPPING_MODE_POLAR_2D,
  //       //     MAPPING_MODE_POLAR_PHI,
  //       //     MAPPING_MODE_POLAR_THETA,
  //       //   ],
  //       // },
  //     },
  //     { collapsed: true }
  //   ),
  // });

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
