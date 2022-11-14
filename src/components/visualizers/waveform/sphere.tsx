import { folder, useControls } from "leva";
import BaseSphere, {
  MAPPING_MODE_POLAR_2D,
  getNorm1DTargetForNorm2DCoord,
} from "../baseSphere";

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

  const getValueForNormalizedCoord = (
    normTheta: number,
    normPhi: number,
    mapMode: string = MAPPING_MODE_POLAR_2D,
    elapsedTimeSec: number = 0
  ): number => {
    const normTarget = getNorm1DTargetForNorm2DCoord(
      normTheta,
      normPhi,
      mapMode
    );
    const phaseShift = elapsedTimeSec;
    return amplitude * Math.sin(b * normTarget + phaseShift);
  };

  return <BaseSphere getValueForNormalizedCoord={getValueForNormalizedCoord} />;
};

export default WaveformSphere;
