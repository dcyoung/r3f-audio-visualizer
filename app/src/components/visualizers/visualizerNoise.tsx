import { type VisualType } from "@/components/visualizers/common";
import { useNoiseGeneratorContext } from "@/context/noiseGenerator";
import { CoordinateMapper_Noise } from "@/lib/mappers/coordinateMappers/noise";

import { Visual } from "./visual";

const NoiseVisual = ({ visual }: { visual: VisualType }) => {
  const { amplitude, spatialScale, timeScale, nIterations } =
    useNoiseGeneratorContext();

  const coordinateMapper = new CoordinateMapper_Noise(
    amplitude,
    spatialScale,
    timeScale,
    nIterations,
  );

  return <Visual visual={visual} coordinateMapper={coordinateMapper} />;
};

export default NoiseVisual;
