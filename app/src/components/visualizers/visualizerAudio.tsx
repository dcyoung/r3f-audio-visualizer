import { useFFTAnalyzerContext } from "@/context/fftAnalyzer";
import { useEnergyInfo, useVisualSourceDataX } from "@/lib/appState";
import { CoordinateMapper_Data } from "@/lib/mappers/coordinateMappers/data";
import { EnergyTracker } from "@/lib/mappers/valueTracker/energyTracker";

import { VISUAL_REGISTRY, type TVisualId } from "./registry";

const AudioVisual = ({ visual }: { visual: TVisualId }) => {
  const freqData = useVisualSourceDataX();
  const energyInfo = useEnergyInfo();
  // TODO: Find a better place to put amplitude settings for this audio visual
  const { amplitude } = useFFTAnalyzerContext();

  const coordinateMapper = new CoordinateMapper_Data(amplitude, freqData);
  const energyTracker = new EnergyTracker(energyInfo);

  const VisualComponent = VISUAL_REGISTRY.get(visual).ReactiveComponent;
  return (
    <VisualComponent
      coordinateMapper={coordinateMapper}
      scalarTracker={energyTracker}
    />
  );
};

export default AudioVisual;
