import { folder, useControls } from "leva";
import React, { Suspense } from "react";
import { useFreqData } from "../appState";
import { CoordinateMapper_Data } from "../coordinateMappers/data";

interface AudioVisualProps {
  visual: string;
}

const AudioVisual = ({ visual }: AudioVisualProps): JSX.Element => {
  const freqData = useFreqData();

  const { amplitude } = useControls({
    Audio: folder({
      amplitude: {
        value: 1.0,
        min: 0.0,
        max: 5.0,
        step: 0.01,
      },
    }),
  });

  const coordinateMapper = new CoordinateMapper_Data(amplitude, freqData);
  const VisualComponent = React.lazy(() => import(`./${visual}/reactive.tsx`));

  return (
    <Suspense fallback={null}>
      <VisualComponent coordinateMapper={coordinateMapper} />
    </Suspense>
  );
};

export default AudioVisual;
