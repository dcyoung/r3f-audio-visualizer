import { folder, useControls } from "leva";
import BaseSphere from "../baseSphere";

interface WaveformSphereProps {
  amplitude?: number;
}

const WaveformSphere = ({
  amplitude = 1.0,
}: WaveformSphereProps): JSX.Element => {
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
    theta: number,
    phi: number,
    elapsedTimeSec: number = 0
  ): number => {
    const normTheta = (theta % (2 * Math.PI)) / (2 * Math.PI);
    const normPhi = (phi % Math.PI) / Math.PI;
    const normTarget =
      Math.hypot(normTheta - 0.5, normPhi - 0.5) / normQuadrantHypotenuse;

    const phaseShift = elapsedTimeSec;
    return amplitude * Math.sin(b * normTarget + phaseShift);
  };

  return (
    <BaseSphere
      getValueForNormalizedCoord={getValueForNormalizedCoord}
    ></BaseSphere>
  );
};

export default WaveformSphere;
