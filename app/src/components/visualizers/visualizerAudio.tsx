import { type VisualType } from "@/components/visualizers/common";
import { useFFTAnalyzerContext } from "@/context/fftAnalyzer";
import { useEnergyInfo, useVisualSourceDataX } from "@/lib/appState";
import { CoordinateMapper_Data } from "@/lib/mappers/coordinateMappers/data";
import { EnergyTracker } from "@/lib/mappers/valueTracker/energyTracker";

import { Visual } from "./visual";

const AudioVisual = ({ visual }: { visual: VisualType }) => {
  const freqData = useVisualSourceDataX();
  const energyInfo = useEnergyInfo();
  // TODO: Find a better place to put amplitude settings for this audio visual
  const { amplitude } = useFFTAnalyzerContext();

  const coordinateMapper = new CoordinateMapper_Data(amplitude, freqData);
  const energyTracker = new EnergyTracker(energyInfo);

  return (
    <Visual
      visual={visual}
      coordinateMapper={coordinateMapper}
      scalarTracker={energyTracker}
    />
  );
};

export default AudioVisual;
