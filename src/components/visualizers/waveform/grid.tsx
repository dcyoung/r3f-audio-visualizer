import { folder, useControls } from "leva";
import { useMemo } from "react";
import BaseGrid from "../baseGrid";
import { getCoordinateMapper2D } from "../utils";

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

  const getValueForNormalizedCoord = useMemo(
    () => getCoordinateMapper2D(amplitude, { frequencyHz: frequencyHz }),
    [frequencyHz, amplitude]
  );
  return <BaseGrid getValueForNormalizedCoord={getValueForNormalizedCoord} />;
};

export default WaveformGrid;
