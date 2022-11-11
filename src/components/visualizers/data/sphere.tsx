import { MutableRefObject } from "react";
import BaseSphere from "../baseSphere";
import { interpolateValueForNormalizedCoord } from "../utils";

interface DataReactiveSphereProps {
  dataRef: MutableRefObject<number[]>;
  amplitude?: number;
}

const DataReactiveSphere = ({
  dataRef,
  amplitude = 1.0,
}: DataReactiveSphereProps): JSX.Element => {
  const normQuadrantHypotenuse = Math.hypot(0.5, 0.5);

  const getValueForNormalizedCoord = (theta: number, phi: number): number => {
    const normTheta = (theta % (2 * Math.PI)) / (2 * Math.PI);
    const normPhi = (phi % Math.PI) / Math.PI;
    const normTarget =
      Math.hypot(normTheta - 0.5, normPhi - 0.5) / normQuadrantHypotenuse;
    return (
      amplitude *
      interpolateValueForNormalizedCoord(dataRef?.current, normTarget)
    );
  };

  return (
    <BaseSphere
      getValueForNormalizedCoord={getValueForNormalizedCoord}
    ></BaseSphere>
  );
};

export default DataReactiveSphere;
