import "./App.css";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Ground from "./components/ground";
import { useControls, Leva } from "leva";
import {
  APPLICATION_MODE_LIVE_STREAM,
  APPLICATION_MODE_MICROPHONE,
  APPLICATION_MODE_WAVE_FORM,
  getSupportedApplicationModes,
  isAudioMode,
} from "./components/application_modes";
import AnaylzerLivestream from "./components/analyzerLivestream";
import AnalyzerMic from "./components/analyzerMic";
import { Vector3 } from "three";
import ReactiveVisual from "./components/reactiveVisual";

const App = (): JSX.Element => {
  const { mode, visualizer, amplitude } = useControls({
    mode: {
      value: APPLICATION_MODE_WAVE_FORM,
      options: getSupportedApplicationModes(),
    },
    visualizer: { value: "grid", options: ["grid", "sphere"] },
    amplitude: { value: 1.0, min: 0.0, max: 5.0, step: 0.01 },
  });
  const freqDataRef = useRef<number[]>(null!);

  const getAppropriateAnalyzerComponent = (mode: string): JSX.Element => {
    switch (mode) {
      case APPLICATION_MODE_LIVE_STREAM:
        return <AnaylzerLivestream freqDataRef={freqDataRef} />;
      case APPLICATION_MODE_MICROPHONE:
        return <AnalyzerMic freqDataRef={freqDataRef} />;
      default:
        return <></>;
    }
  };
  return (
    <Suspense fallback={<span>loading...</span>}>
      {getAppropriateAnalyzerComponent(mode)}
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
        <Ground position={new Vector3(0, 0, -2.5 * amplitude)} />
        {isAudioMode(mode) ? (
          <ReactiveVisual
            visual={visualizer}
            useData={true}
            amplitude={amplitude}
            dataRef={freqDataRef}
          />
        ) : (
          <ReactiveVisual
            visual={visualizer}
            useData={false}
            amplitude={amplitude}
          />
        )}
        {/* <Stats /> */}
        <OrbitControls />
      </Canvas>
      <Leva collapsed={true} />
    </Suspense>
  );
};

export default App;
