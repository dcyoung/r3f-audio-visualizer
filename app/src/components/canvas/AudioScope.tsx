import { Canvas } from "@react-three/fiber";

import { CanvasBackground } from "./common";
import AudioScopeVisual from "../visualizers/visualizerAudioScope";

const AudioScopeCanvas = () => {
  return (
    <Canvas>
      <CanvasBackground />
      <AudioScopeVisual />
    </Canvas>
  );
};
export default AudioScopeCanvas;
