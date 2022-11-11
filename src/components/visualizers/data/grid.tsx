import { MutableRefObject } from "react";
import BaseGrid from "../baseGrid";
import { interpolateValueForNormalizedCoord } from "../utils";

interface DataReactiveGridProps {
  dataRef: MutableRefObject<number[]>;
  amplitude?: number;
}

const DataReactiveGrid = ({
  dataRef,
  amplitude = 1.0,
}: DataReactiveGridProps): JSX.Element => {
  const normQuadrantHypotenuse = Math.hypot(0.5, 0.5);

  const getValueForNormalizedCoord = (
    normGridX: number,
    normGridY: number
  ): number => {
    const normRadialOffset =
      Math.hypot(normGridX - 0.5, normGridY - 0.5) / normQuadrantHypotenuse;
    return (
      amplitude *
      interpolateValueForNormalizedCoord(dataRef?.current, normRadialOffset)
    );
  };

  return (
    <BaseGrid
      getValueForNormalizedCoord={getValueForNormalizedCoord}
    ></BaseGrid>
  );
};

export default DataReactiveGrid;
