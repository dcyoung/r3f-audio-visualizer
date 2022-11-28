import { folder, useControls } from "leva";
import BaseDiffusedRing from "./base";
import { _2PI } from "../utils";
import { useAppState } from "../../appState";
import { ECoordinateType } from "../../coordinateMapper";
import { useEffect } from "react";
import Ground from "../../ground";
import { Vector3 } from "three";

interface DiffusedRingVisualProps {}

const DiffusedRingVisual = ({}: DiffusedRingVisualProps): JSX.Element => {
  const { radius, pointSize } = useControls({
    Ring: folder(
      {
        radius: { value: 2, min: 0.25, max: 3, step: 0.25 },
        pointSize: { value: 0.2, min: 0.01, max: 2, step: 0.01 },
      },
      { collapsed: true }
    ),
  });
  const amplitude = useAppState((state) => state.amplitude);
  const coordinateMapper = useAppState((state) => state.coordinateMapper);
  const updateCoordinateType = useAppState(
    (state) => state.updateCoordinateType
  );

  useEffect(() => {
    updateCoordinateType(ECoordinateType.Cartesian_1D);
  }, []);

  return (
    <>
      <BaseDiffusedRing
        coordinateMapper={coordinateMapper}
        radius={radius}
        pointSize={pointSize}
      />
      <Ground position={new Vector3(0, 0, -1.5 * amplitude)} />
    </>
  );
};

export default DiffusedRingVisual;
