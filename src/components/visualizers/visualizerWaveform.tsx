import React, { Suspense, useEffect } from "react";
import { EMappingSourceType } from "../coordinateMapper";
import { useAppState } from "../appState";
import WaveformControls from "../controls/waveformControls";

interface WaveformVisualProps {
  visual: string;
}

const WaveformVisual = ({ visual }: WaveformVisualProps): JSX.Element => {
  const updateMappingType = useAppState((state) => state.updateMappingType);
  const VisualComponent = React.lazy(() => import(`./${visual}/reactive.tsx`));

  useEffect(() => {
    updateMappingType(EMappingSourceType.Waveform_Single);
  }, []);

  return (
    <>
      <WaveformControls></WaveformControls>
      <Suspense fallback={null}>
        <VisualComponent />
      </Suspense>
    </>
  );
};

export default WaveformVisual;
