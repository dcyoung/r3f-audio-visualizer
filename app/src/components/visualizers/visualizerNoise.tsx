import { useNoiseGeneratorContext } from "@/context/noiseGenerator";
import { CoordinateMapper_Noise } from "@/lib/mappers/coordinateMappers/noise";

import { type TVisual } from "./registry";

const NoiseVisual = ({ visual }: { visual: TVisual }) => {
  const { amplitude, spatialScale, timeScale, nIterations } =
    useNoiseGeneratorContext();

  const coordinateMapper = new CoordinateMapper_Noise(
    amplitude,
    spatialScale,
    timeScale,
    nIterations,
  );

  return <visual.ReactiveComponent coordinateMapper={coordinateMapper} />;
};

export default NoiseVisual;
