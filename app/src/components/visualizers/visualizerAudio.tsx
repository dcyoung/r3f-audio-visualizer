import { Suspense, lazy } from "react";

import { useFFTAnalyzerContext } from "@/context/fftAnalyzer";
import { useEnergyInfo, useVisualSourceDataX } from "@/lib/appState";
import { CoordinateMapper_Data } from "@/lib/mappers/coordinateMappers/data";
import { EnergyTracker } from "@/lib/mappers/valueTracker/energyTracker";
import { type ColorPaletteType, COLOR_PALETTE } from "@/lib/palettes";

const AudioVisual = ({
  visual,
  palette = COLOR_PALETTE.THREE_COOL_TO_WARM,
}: {
  visual: string;
  palette?: ColorPaletteType;
}) => {
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
  const VisualComponent = lazy(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    async () => await import(`./${visual}/reactive.tsx`)
  );

  return (
    <Suspense fallback={null}>
      <VisualComponent
        coordinateMapper={coordinateMapper}
        scalarTracker={energyTracker}
        palette={palette}
      />
    </Suspense>
  );
};

export default AudioVisual;
