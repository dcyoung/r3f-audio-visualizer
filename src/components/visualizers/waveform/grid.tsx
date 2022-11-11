import { folder, useControls } from "leva";
import BaseGrid from "../baseGrid";

interface WaveformGridProps {
  amplitude?: number;
}

const WaveformGrid = ({ amplitude = 1.0 }: WaveformGridProps): JSX.Element => {
  const { frequencyHz } = useControls({
    "Wave Generator": folder({
      frequencyHz: {
        value: 2,
        min: 0.0,
        max: 30,
        step: 0.05,
      },
    }),
  });
  const periodSec = 1 / frequencyHz;
  const b = (2 * Math.PI) / periodSec;
  const normQuadrantHypotenuse = Math.hypot(0.5, 0.5);

  const getValueForNormalizedCoord = (
    normGridX: number,
    normGridY: number,
    elapsedTimeSec: number = 0
  ): number => {
    const normRadialOffset =
      Math.hypot(normGridX - 0.5, normGridY - 0.5) / normQuadrantHypotenuse;
    const phaseShift = elapsedTimeSec;
    return amplitude * Math.sin(b * normRadialOffset + phaseShift);
  };

  return (
    <BaseGrid
      getValueForNormalizedCoord={getValueForNormalizedCoord}
    ></BaseGrid>
  );
};

export default WaveformGrid;
