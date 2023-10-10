import { Suspense } from "react";

import { TextureMapper } from "@/components/visualizers/audioScope/base";
import ScopeVisual from "@/components/visualizers/audioScope/reactive";
import { useVisualSourceDataX, useVisualSourceDataY } from "@/lib/appState";

const AudioScopeVisual = () => {
  const timeSamples = useVisualSourceDataX();
  const quadSamples = useVisualSourceDataY();

  const textureMapper = new TextureMapper(timeSamples, quadSamples);

  return (
    <Suspense fallback={null}>
      <ScopeVisual textureMapper={textureMapper} />
    </Suspense>
  );
};

export default AudioScopeVisual;
