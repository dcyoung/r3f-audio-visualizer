import { MutableRefObject } from "react";
import BaseGrid from "./baseGrid";

function interpolateValueForNormalizedCoord(bars: number[], normalizedCoord: number): number {
  if (bars === undefined || !bars || bars.length === 0) {
    return 0;
  }
  // Interpolate from the bar values based on the normalized Coord
  let rawIdx = normalizedCoord * (bars.length - 1);
  let valueBelow = bars[Math.floor(rawIdx)];
  let valueAbove = bars[Math.ceil(rawIdx)];
  return valueBelow + (rawIdx % 1) * (valueAbove - valueBelow);
}

interface DataReactiveGridProps {
  dataRef: MutableRefObject<number[]>
  amplitude?: number
}

const DataReactiveGrid = ({
  dataRef,
  amplitude = 1.0
}: DataReactiveGridProps): JSX.Element => {
  const normQuadrantHypotenuse = Math.hypot(0.5, 0.5);

  const getValueForNormalizedCoord = (normGridX: number, normGridY: number): number => {
    const normRadialOffset = Math.hypot(normGridX - 0.5, normGridY - 0.5) / normQuadrantHypotenuse;
    return amplitude * interpolateValueForNormalizedCoord(dataRef?.current, normRadialOffset);
  }

  return (<BaseGrid getValueForNormalizedCoord={getValueForNormalizedCoord}></BaseGrid>);
}

export default DataReactiveGrid;
