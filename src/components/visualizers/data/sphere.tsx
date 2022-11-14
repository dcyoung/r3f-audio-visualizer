import { MutableRefObject } from "react";
import BaseSphere, {
  getNorm1DTargetForNorm2DCoord,
  MAPPING_MODE_POLAR_2D,
} from "../baseSphere";
import { interpolateValueForNormalizedCoord } from "../utils";

interface DataReactiveSphereProps {
  dataRef: MutableRefObject<number[]>;
  amplitude?: number;
}

const DataReactiveSphere = ({
  dataRef,
  amplitude = 1.0,
}: DataReactiveSphereProps): JSX.Element => {
  const getValueForNormalizedCoord = (
    normTheta: number,
    normPhi: number,
    mapMode: string = MAPPING_MODE_POLAR_2D
  ): number => {
    const normTarget = getNorm1DTargetForNorm2DCoord(
      normTheta,
      normPhi,
      mapMode
    );
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
