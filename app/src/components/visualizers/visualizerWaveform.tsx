import { type TVisual } from "@/components/visualizers/registry";
import { useWaveGeneratorContext } from "@/context/waveGenerator";
import { CoordinateMapper_WaveformSuperposition } from "@/lib/mappers/coordinateMappers/waveform";

const WaveformVisual = ({ visual }: { visual: TVisual }) => {
  const { maxAmplitude, waveformFrequenciesHz, amplitudeSplitRatio } =
    useWaveGeneratorContext();

  const coordinateMapper = new CoordinateMapper_WaveformSuperposition(
    waveformFrequenciesHz,
    maxAmplitude,
    amplitudeSplitRatio,
  );

  return <visual.ReactiveComponent coordinateMapper={coordinateMapper} />;
};

export default WaveformVisual;
