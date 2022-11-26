import { folder, useControls } from "leva";
import { MutableRefObject, useMemo } from "react";
import BaseCube from "../baseCube";
import { getCoordinateMapper3D } from "../utils";

interface DataReactiveCubeProps {
  dataRef: MutableRefObject<number[]>;
  amplitude?: number;
}

const DataReactiveCube = ({
  dataRef,
  amplitude = 1.0,
}: DataReactiveCubeProps): JSX.Element => {
  const { volume } = useControls({
    Visual: folder(
      {
        volume: true,
      },
      { collapsed: true }
    ),
  });

  const getValueForNormalizedCoord = useMemo(
    () => getCoordinateMapper3D(amplitude, { dataRef: dataRef }, volume),
    [amplitude, volume, dataRef]
  );

  return (
    <BaseCube
      getValueForNormalizedCoord={getValueForNormalizedCoord}
    ></BaseCube>
  );
};

export default DataReactiveCube;
