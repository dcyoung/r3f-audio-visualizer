import { Suspense } from "react";
import ScopeVisual from "@/components/visualizers/audioScope/reactive";
import { useTextureMapper } from "@/lib/appState";

const AudioScopeVisual = () => {
  const textureMapper = useTextureMapper();
  return (
    <Suspense fallback={null}>
      <ScopeVisual textureMapper={textureMapper} />
    </Suspense>
  );
};

export default AudioScopeVisual;
