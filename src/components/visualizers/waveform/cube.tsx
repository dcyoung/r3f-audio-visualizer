import { folder, useControls } from "leva";
import { useMemo } from "react";
import BaseCube from "../baseCube";
import { getCoordinateMapper3D } from "../utils";

interface WaveformCubeProps {
  amplitude?: number;
}

const WaveformCube = ({ amplitude = 1.0 }: WaveformCubeProps): JSX.Element => {
  const { frequencyHz, volume } = useControls({
    "Wave Generator": folder({
      frequencyHz: {
        value: 2,
        min: 0.0,
        max: 30,
        step: 0.05,
      },
      volume: true,
    }),
  });

  const getValueForNormalizedCoord = useMemo(
    () =>
      getCoordinateMapper3D(amplitude, { frequencyHz: frequencyHz }, volume),
    [frequencyHz, amplitude, volume]
  );

  return <BaseCube getValueForNormalizedCoord={getValueForNormalizedCoord} />;
};

export default WaveformCube;
