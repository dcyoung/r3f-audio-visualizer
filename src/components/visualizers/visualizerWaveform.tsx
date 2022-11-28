import { useControls } from "leva";
import React, { Suspense, useEffect } from "react";
import { EMappingSourceType } from "../coordinateMapper";
import { useAppState } from "../appState";
import WaveformControls from "../controls/waveformControls";

interface WaveformVisualizerProps {
  visual: string;
}

const AudioVisual = ({ visual }: WaveformVisualizerProps): JSX.Element => {
  const updateMappingType = useAppState((state) => state.updateMappingType);

  useEffect(() => {
    updateMappingType(EMappingSourceType.Waveform);
  }, []);

  const VisualComponent = React.lazy(() => import(`./${visual}/reactive.tsx`));
  return (
    <>
      <WaveformControls nWaves={visual == "diffusedRing" ? 2 : 1} />
      <Suspense fallback={null}>
        <VisualComponent />
      </Suspense>
    </>
  );
};

export default AudioVisual;
