import { Suspense, lazy, useMemo } from "react";

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

  // const { amplitude } = useControls({
  //   Audio: folder({
  //     amplitude: {
  //       value: 1.0,
  //       order: 74,
  //       min: 0.0,
  //       max: 5.0,
  //       step: 0.01,
  //     },
  //   }),
  // });

  const coordinateMapper = new CoordinateMapper_Data(amplitude, freqData);
  const energyTracker = new EnergyTracker(energyInfo);
  const VisualComponent = useMemo(
    () =>
      lazy(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        async () => await import(`./${visual}/reactive.tsx`)
      ),
    [visual]
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
