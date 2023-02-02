import { folder, useControls } from "leva";
import React, { Suspense } from "react";
import { useEnergyInfo, useVisualSourceDataX } from "../../appState";
import { CoordinateMapper_Data } from "../coordinateMappers/data";
import { EnergyTracker } from "../valueTracker/energyTracker";

interface AudioVisualProps {
  visual: string;
}

const AudioVisual = ({ visual }: AudioVisualProps): JSX.Element => {
  const freqData = useVisualSourceDataX();
  const energyInfo = useEnergyInfo();

  const { amplitude } = useControls({
    Audio: folder({
      amplitude: {
        value: 1.0,
        order: 74,
        min: 0.0,
        max: 5.0,
        step: 0.01,
      },
    }),
  });

  const coordinateMapper = new CoordinateMapper_Data(amplitude, freqData);
  const energyTracker = new EnergyTracker(energyInfo);
  const VisualComponent = React.lazy(() => import(`./${visual}/reactive.tsx`));

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
