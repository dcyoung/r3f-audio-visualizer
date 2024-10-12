import { CanvasBackground } from "@/components/canvas/common";
import { Canvas } from "@react-three/fiber";

import ModalVisual from "../visualizers/visualizerModal";

const AudioScopeCanvas = () => {
  return (
    <Canvas>
      <CanvasBackground />
      <ModalVisual />
    </Canvas>
  );
};
export default AudioScopeCanvas;
