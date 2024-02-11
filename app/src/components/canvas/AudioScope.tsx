import { CanvasBackground } from "@/components/canvas/common";
import AudioScopeVisual from "@/components/visualizers/visualizerAudioScope";
import { Canvas } from "@react-three/fiber";

const AudioScopeCanvas = () => {
  return (
    <Canvas>
      <CanvasBackground />
      <AudioScopeVisual />
    </Canvas>
  );
};
export default AudioScopeCanvas;
