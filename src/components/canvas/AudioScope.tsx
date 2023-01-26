import { Canvas } from "@react-three/fiber";
import AudioScopeVisual from "../visualizers/visualizerAudioScope";

const AudioScopeCanvas = (): JSX.Element => {
  return (
    <Canvas>
      <color attach="background" args={["black"]} />
      <AudioScopeVisual />
    </Canvas>
  );
};
export default AudioScopeCanvas;
