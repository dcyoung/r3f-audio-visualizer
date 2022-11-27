import { folder, useControls } from "leva";
import { useEffect } from "react";
import { Vector3 } from "three";
import { ECoordinateType } from "../../coordinateMapper";
import Ground from "../../ground";
import { useAppState } from "../../appState";
import BaseSphere from "./base";

interface SpherVisualProps {}

const SphereVisual = ({}: SpherVisualProps): JSX.Element => {
  const {
    radius,
    nPoints,
    cubeSideLength,
    // mapMode
  } = useControls({
    Sphere: folder(
      {
        radius: { value: 2, min: 0.25, max: 3, step: 0.25 },
        nPoints: { value: 800, min: 100, max: 2000, step: 25 },
        cubeSideLength: {
          value: 0.05,
          min: 0.01,
          max: 0.5,
          step: 0.005,
        },
        // mapMode: {
        //   value: MAPPING_MODE_POLAR_2D,
        //   options: [
        //     MAPPING_MODE_POLAR_2D,
        //     MAPPING_MODE_POLAR_PHI,
        //     MAPPING_MODE_POLAR_THETA,
        //   ],
        // },
      },
      { collapsed: true }
    ),
  });
  const amplitude = useAppState((state) => state.amplitude);
  const updateCoordinateType = useAppState(
    (state) => state.updateCoordinateType
  );

  useEffect(() => {
    updateCoordinateType(ECoordinateType.Polar);
  }, []);

  return (
    <>
      <BaseSphere
        radius={radius}
        nPoints={nPoints}
        cubeSideLength={cubeSideLength}
      />
      <Ground position={new Vector3(0, 0, -4 * amplitude)} />
    </>
  );
};

export default SphereVisual;
