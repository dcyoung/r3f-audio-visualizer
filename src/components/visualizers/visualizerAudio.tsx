import { useControls } from "leva";
import React, { Suspense, useEffect } from "react";
import { EMappingSourceType } from "../coordinateMapper";
import { useAppState } from "../appState";

interface AudioVisualProps {
  visual: string;
}

const AudioVisual = ({ visual }: AudioVisualProps): JSX.Element => {
  const updateMappingType = useAppState((state) => state.updateMappingType);
  const updateAmplitude = useAppState((state) => state.updateAmplitude);
  useControls(
    () => ({
      amplitude: {
        value: 1.0,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (v) => {
          updateAmplitude(v);
        },
      },
    }),
    [updateAmplitude]
  );

  useEffect(() => {
    updateMappingType(EMappingSourceType.Data_1D);
  }, []);

  const VisualComponent = React.lazy(() => import(`./${visual}/reactive.tsx`));
  return (
    <Suspense fallback={null}>
      <VisualComponent />
    </Suspense>
  );
};

export default AudioVisual;
