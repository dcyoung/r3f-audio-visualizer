import { MutableRefObject } from "react";
import BaseDiffusedRing from "../baseDiffusedRing";
import { interpolateValueForNormalizedCoord } from "../utils";

interface DataReactiveDiffusedRingProps {
  dataRef: MutableRefObject<number[]>;
  amplitude?: number;
}

const DataReactiveDiffusedRing = ({
  dataRef,
  amplitude = 1.0,
}: DataReactiveDiffusedRingProps): JSX.Element => {
  const getValueForNormalizedCoord = (normAngle: number): number => {
    return (
      amplitude *
      interpolateValueForNormalizedCoord(dataRef?.current, normAngle)
    );
  };

  return (
    <BaseDiffusedRing
      getValueForNormalizedCoord={getValueForNormalizedCoord}
    ></BaseDiffusedRing>
  );
};

export default DataReactiveDiffusedRing;
