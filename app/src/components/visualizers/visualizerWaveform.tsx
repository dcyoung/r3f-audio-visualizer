import { type TVisualId } from "@/components/visualizers/registry";
import { useWaveGeneratorContext } from "@/context/waveGenerator";
import { CoordinateMapper_WaveformSuperposition } from "@/lib/mappers/coordinateMappers/waveform";

import { VISUAL_REGISTRY } from "./registry";

const WaveformVisual = ({ visual }: { visual: TVisualId }) => {
  const { maxAmplitude, waveformFrequenciesHz, amplitudeSplitRatio } =
    useWaveGeneratorContext();

  const coordinateMapper = new CoordinateMapper_WaveformSuperposition(
    waveformFrequenciesHz,
    maxAmplitude,
    amplitudeSplitRatio,
  );

  const VisualComponent = VISUAL_REGISTRY.get(visual).ReactiveComponent;
  return <VisualComponent coordinateMapper={coordinateMapper} />;
};

export default WaveformVisual;
