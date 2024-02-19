import { type VisualType } from "@/components/visualizers/common";
import { useWaveGeneratorContext } from "@/context/waveGenerator";
import { CoordinateMapper_WaveformSuperposition } from "@/lib/mappers/coordinateMappers/waveform";

import { Visual } from "./visual";

const WaveformVisual = ({ visual }: { visual: VisualType }) => {
  const { maxAmplitude, waveformFrequenciesHz, amplitudeSplitRatio } =
    useWaveGeneratorContext();

  const coordinateMapper = new CoordinateMapper_WaveformSuperposition(
    waveformFrequenciesHz,
    maxAmplitude,
    amplitudeSplitRatio,
  );

  return <Visual visual={visual} coordinateMapper={coordinateMapper} />;
};

export default WaveformVisual;
