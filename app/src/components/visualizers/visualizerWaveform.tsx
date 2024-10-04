import { type VisualType } from "@/components/visualizers/common";
import { useWaveGeneratorContext } from "@/context/waveGenerator";
import { CoordinateMapper_WaveformSuperposition } from "@/lib/mappers/coordinateMappers/waveform";

import { VisualRegistry } from "./registry";

const WaveformVisual = ({ visual }: { visual: VisualType }) => {
  const { maxAmplitude, waveformFrequenciesHz, amplitudeSplitRatio } =
    useWaveGeneratorContext();

  const coordinateMapper = new CoordinateMapper_WaveformSuperposition(
    waveformFrequenciesHz,
    maxAmplitude,
    amplitudeSplitRatio,
  );

  const VisualComponent = VisualRegistry.get(visual)?.ReactiveComponent;
  if (!VisualComponent) {
    return null;
  }
  return <VisualComponent coordinateMapper={coordinateMapper} />;
};

export default WaveformVisual;
