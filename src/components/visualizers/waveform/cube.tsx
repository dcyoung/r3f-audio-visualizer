import { folder, useControls } from "leva";
import BaseCube from "../baseCube";

interface WaveformCubeProps {
  amplitude?: number;
}

const WaveformCube = ({ amplitude = 1.0 }: WaveformCubeProps): JSX.Element => {
  const { frequencyHz, faceOnly } = useControls({
    "Wave Generator": folder({
      frequencyHz: {
        value: 2,
        min: 0.0,
        max: 30,
        step: 0.05,
      },
      faceOnly: false,
    }),
  });
  const periodSec = 1 / frequencyHz;
  const b = (2 * Math.PI) / periodSec;
  const normQuadrantHypotenuse2D = Math.hypot(0.5, 0.5);
  const normQuadrantHypotenuse3D = Math.hypot(0.5, 0.5, 0.5);

  const getValueForNormalizedCoord = (
    normCubeX: number,
    normCubeY: number,
    normCubeZ: number,
    elapsedTimeSec: number = 0
  ): number => {
    let normRadialOffset = 1;
    if (faceOnly) {
      // calculate a radial offset for each face
      // (ie: treat each face as a grid and calculate radial dist from center of grid)
      // Exterior:
      if (normCubeX == 0 || normCubeX == 1) {
        normRadialOffset =
          Math.hypot(normCubeY - 0.5, normCubeZ - 0.5) /
          normQuadrantHypotenuse2D;
      } else if (normCubeY == 0 || normCubeY == 1) {
        normRadialOffset =
          Math.hypot(normCubeX - 0.5, normCubeZ - 0.5) /
          normQuadrantHypotenuse2D;
      } else if (normCubeZ == 0 || normCubeZ == 1) {
        normRadialOffset =
          Math.hypot(normCubeX - 0.5, normCubeY - 0.5) /
          normQuadrantHypotenuse2D;
      } else {
        // interior
        return 1;
      }
    } else {
      normRadialOffset =
        Math.hypot(normCubeX - 0.5, normCubeY - 0.5, normCubeZ - 0.5) /
        normQuadrantHypotenuse3D;
    }
    const phaseShift = elapsedTimeSec;
    return amplitude * Math.sin(b * normRadialOffset + phaseShift);
  };

  return <BaseCube getValueForNormalizedCoord={getValueForNormalizedCoord} />;
};

export default WaveformCube;
