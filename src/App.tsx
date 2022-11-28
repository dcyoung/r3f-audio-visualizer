import "./App.css";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls, Leva } from "leva";
import {
  APPLICATION_MODE_WAVE_FORM,
  getSupportedApplicationModes,
  isAudioMode,
} from "./components/applicationModes";
import AudioAnalyzer from "./components/analyzers/audioAnalyzer";
import AudioVisual from "./components/visualizers/visualizerAudio";
import WaveformVisual from "./components/visualizers/visualizerWaveform";

const App = (): JSX.Element => {
  const { mode, visualizer } = useControls({
    mode: {
      value: APPLICATION_MODE_WAVE_FORM,
      options: getSupportedApplicationModes(),
    },
    visualizer: {
      value: "grid",
      options: ["grid", "sphere", "cube", "diffusedRing"],
    },
  });

  return (
    <Suspense fallback={<span>loading...</span>}>
      {isAudioMode(mode) ? <AudioAnalyzer mode={mode} /> : null}
      <Canvas
        camera={{
          fov: 45,
          near: 1,
          far: 1000,
          position: [-17, -6, 6.5],
          up: [0, 0, 1],
        }}
      >
        <color attach="background" args={["#191920"]} />
        <ambientLight />
        <fog attach="fog" args={["#191920", 0, 100]} />
        {isAudioMode(mode) ? (
          <AudioVisual visual={visualizer} />
        ) : (
          <WaveformVisual visual={visualizer} />
        )}
        {/* <Stats /> */}
        <OrbitControls />
      </Canvas>
      <Leva collapsed={true} />
    </Suspense>
  );
};

export default App;
