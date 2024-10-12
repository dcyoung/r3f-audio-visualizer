import { Canvas } from "@react-three/fiber";

import ModalVisual from "../visualizers/visualizerModal";

const AudioScopeCanvas = () => {
  return (
    <Canvas>
      <color attach="background" args={["#010204"]} />;
      <ModalVisual />
    </Canvas>
  );
};
export default AudioScopeCanvas;
