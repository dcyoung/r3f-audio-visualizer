import { Suspense, lazy, useMemo } from "react";

import { type VisualType } from "@/components/visualizers/common";
import { useWaveGeneratorContext } from "@/context/waveGenerator";
import { CoordinateMapper_WaveformSuperposition } from "@/lib/mappers/coordinateMappers/waveform";

const WaveformVisual = ({ visual }: { visual: VisualType }) => {
  const VisualComponent = useMemo(
    () =>
      lazy(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        async () => await import(`./${visual}/reactive.tsx`)
      ),
    [visual]
  );

  const { maxAmplitude, waveformFrequenciesHz, amplitudeSplitRatio } =
    useWaveGeneratorContext();

  const coordinateMapper = new CoordinateMapper_WaveformSuperposition(
    waveformFrequenciesHz,
    maxAmplitude,
    amplitudeSplitRatio
  );

  return (
    <Suspense fallback={null}>
      <VisualComponent coordinateMapper={coordinateMapper} />
    </Suspense>
  );
};

export default WaveformVisual;
