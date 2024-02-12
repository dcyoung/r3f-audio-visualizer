import { lazy, Suspense, useMemo } from "react";
import { type VisualType } from "@/components/visualizers/common";
import { useFFTAnalyzerContext } from "@/context/fftAnalyzer";
import { useEnergyInfo, useVisualSourceDataX } from "@/lib/appState";
import { CoordinateMapper_Data } from "@/lib/mappers/coordinateMappers/data";
import { EnergyTracker } from "@/lib/mappers/valueTracker/energyTracker";

const AudioVisual = ({ visual }: { visual: VisualType }) => {
  const freqData = useVisualSourceDataX();
  const energyInfo = useEnergyInfo();
  // TODO: Find a better place to put amplitude settings for this audio visual
  const { amplitude } = useFFTAnalyzerContext();

  const coordinateMapper = new CoordinateMapper_Data(amplitude, freqData);
  const energyTracker = new EnergyTracker(energyInfo);

  const VisualComponent = useMemo(
    () =>
      lazy(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        async () => await import(`./${visual}/reactive.tsx`),
      ),
    [visual],
  );

  return (
    <Suspense fallback={null}>
      <VisualComponent
        coordinateMapper={coordinateMapper}
        scalarTracker={energyTracker}
      />
    </Suspense>
  );
};

export default AudioVisual;
