import { Suspense } from "react";
import { useVisualSourceDataX, useVisualSourceDataY } from "../../appState";
import ScopeVisual, { TextureMapper } from "./audioScope/reactive";

interface AudioScopeVisualProps {}

const AudioScopeVisual = ({}: AudioScopeVisualProps): JSX.Element => {
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
