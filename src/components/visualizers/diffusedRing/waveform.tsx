import { folder, useControls } from "leva";
import BaseDiffusedRing from "./base";
import { _2PI } from "../utils";

interface WaveformDiffusedRingProps {
  amplitude?: number;
}

const WaveformDiffusedRing = ({
  amplitude = 1.0,
}: WaveformDiffusedRingProps): JSX.Element => {
  const { frequencyHz_1, frequencyHz_2 } = useControls({
    "Wave Generator": folder({
      frequencyHz_1: {
        value: 2,
        min: 0.0,
        max: 30,
        step: 0.05,
      },
      frequencyHz_2: {
        value: 10,
        min: 0.0,
        max: 30,
        step: 0.05,
      },
    }),
  });
  const periodSec_1 = 1 / frequencyHz_1;
  const b_1 = _2PI / periodSec_1;
  const periodSec_2 = 1 / frequencyHz_2;
  const b_2 = _2PI / periodSec_2;

  const getValueForNormalizedCoord = (
    normAngle: number,
    elapsedTimeSec: number = 0
  ): number => {
    const phaseShift = elapsedTimeSec;
    return (
      amplitude * Math.sin(b_1 * normAngle + phaseShift) +
      amplitude * 0.2 * Math.cos(b_2 * normAngle + phaseShift)
    );
  };

  return (
    <BaseDiffusedRing getValueForNormalizedCoord={getValueForNormalizedCoord} />
  );
};

export default WaveformDiffusedRing;
