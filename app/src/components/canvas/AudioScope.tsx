import { CanvasBackground } from "@/components/canvas/common";
import { Canvas } from "@react-three/fiber";

import { VISUAL_REGISTRY } from "../visualizers/registry";
import ModalVisual from "../visualizers/visualizerModal";

const AudioScopeCanvas = () => {
  return (
    <Canvas>
      <CanvasBackground />
      <ModalVisual visual={VISUAL_REGISTRY.scope} />
    </Canvas>
  );
};
export default AudioScopeCanvas;
