import { folder, useControls } from "leva";
import BaseDiffusedRing from "./base";
import Ground from "../../ground";
import { Vector3 } from "three";
import { VisualProps } from "../common";

const DiffusedRingVisual = ({ coordinateMapper }: VisualProps): JSX.Element => {
  const { radius, pointSize } = useControls({
    "Visual - Ring": folder(
      {
        radius: { value: 2, min: 0.25, max: 3, step: 0.25 },
        pointSize: { value: 0.2, min: 0.01, max: 2, step: 0.01 },
      },
      { collapsed: true }
    ),
  });

  return (
    <>
      <BaseDiffusedRing
        coordinateMapper={coordinateMapper}
        radius={radius}
        pointSize={pointSize}
      />
      <Ground position={new Vector3(0, 0, -1.5 * coordinateMapper.amplitude)} />
    </>
  );
};

export default DiffusedRingVisual;
