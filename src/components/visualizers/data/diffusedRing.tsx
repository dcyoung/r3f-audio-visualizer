import { MutableRefObject, useMemo } from "react";
import BaseDiffusedRing from "../baseDiffusedRing";
import { getCoordinateMapper1D } from "../utils";

interface DataReactiveDiffusedRingProps {
  dataRef: MutableRefObject<number[]>;
  amplitude?: number;
}

const DataReactiveDiffusedRing = ({
  dataRef,
  amplitude = 1.0,
}: DataReactiveDiffusedRingProps): JSX.Element => {
  const getValueForNormalizedCoord = useMemo(
    () => getCoordinateMapper1D(amplitude, { dataRef: dataRef }),
    [dataRef, amplitude]
  );

  return (
    <BaseDiffusedRing
      getValueForNormalizedCoord={getValueForNormalizedCoord}
    ></BaseDiffusedRing>
  );
};

export default DataReactiveDiffusedRing;
