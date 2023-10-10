import { Canvas } from "@react-three/fiber";

import { CanvasBackground } from "@/components/canvas/common";
import AudioScopeVisual from "@/components/visualizers/visualizerAudioScope";

const AudioScopeCanvas = () => {
  return (
    <Canvas>
      <CanvasBackground />
      <AudioScopeVisual />
    </Canvas>
  );
};
export default AudioScopeCanvas;
