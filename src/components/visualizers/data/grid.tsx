import { MutableRefObject, useMemo } from "react";
import BaseGrid from "../baseGrid";
import { getCoordinateMapper2D } from "../utils";

interface DataReactiveGridProps {
  dataRef: MutableRefObject<number[]>;
  amplitude?: number;
}

const DataReactiveGrid = ({
  dataRef,
  amplitude = 1.0,
}: DataReactiveGridProps): JSX.Element => {
  const getValueForNormalizedCoord = useMemo(
    () => getCoordinateMapper2D(amplitude, { dataRef: dataRef }),
    [amplitude, dataRef]
  );

  return (
    <BaseGrid
      getValueForNormalizedCoord={getValueForNormalizedCoord}
    ></BaseGrid>
  );
};

export default DataReactiveGrid;
