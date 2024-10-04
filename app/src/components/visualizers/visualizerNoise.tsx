import { type VisualType } from "@/components/visualizers/common";
import { useNoiseGeneratorContext } from "@/context/noiseGenerator";
import { CoordinateMapper_Noise } from "@/lib/mappers/coordinateMappers/noise";

import { VisualRegistry } from "./registry";

const NoiseVisual = ({ visual }: { visual: VisualType }) => {
  const { amplitude, spatialScale, timeScale, nIterations } =
    useNoiseGeneratorContext();

  const coordinateMapper = new CoordinateMapper_Noise(
    amplitude,
    spatialScale,
    timeScale,
    nIterations,
  );

  const VisualComponent = VisualRegistry.get(visual)?.ReactiveComponent;
  if (!VisualComponent) {
    return null;
  }
  return <VisualComponent coordinateMapper={coordinateMapper} />;
};

export default NoiseVisual;
