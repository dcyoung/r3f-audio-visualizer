import { useNoiseGeneratorContext } from "@/context/noiseGenerator";
import { CoordinateMapper_Noise } from "@/lib/mappers/coordinateMappers/noise";

import { VISUAL_REGISTRY, type TVisualId } from "./registry";

const NoiseVisual = ({ visual }: { visual: TVisualId }) => {
  const { amplitude, spatialScale, timeScale, nIterations } =
    useNoiseGeneratorContext();

  const coordinateMapper = new CoordinateMapper_Noise(
    amplitude,
    spatialScale,
    timeScale,
    nIterations,
  );

  const VisualComponent = VISUAL_REGISTRY.get(visual).ReactiveComponent;
  return <VisualComponent coordinateMapper={coordinateMapper} />;
};

export default NoiseVisual;
