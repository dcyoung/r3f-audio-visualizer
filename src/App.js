import "./App.css";
import WaveformGrid from "./components/waveformGrid";
import DataReactiveGrid from "./components/dataReactiveGrid";
import AnalyzerMic from "./components/analyzerMic";
import AnaylzerLivestream from "./components/analyzerLivestream";
import Ground from "./components/ground";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { KernelSize } from "postprocessing";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useControls } from "leva";

function App() {
  const { mode, amplitude } = useControls({
    mode: { value: "waveform", options: ["waveform", "livestream", "mic"] },
    amplitude: { value: 1.0, min: 0.0, max: 5.0, step: 0.01 },
  });
  const freqDataRef = useRef();

  const isAudioMode = () => {
    return ["livestream", "mic"].includes(mode);
  };

  return (
    <Suspense fallback={<span>loading...</span>}>
      {isAudioMode() &&
        {
          livestream: <AnaylzerLivestream freqDataRef={freqDataRef} />,
          mic: <AnalyzerMic freqDataRef={freqDataRef} />,
        }[mode]}
      <Canvas
        mode="concurrent"
        camera={{
          fov: 45,
          near: 1,
          far: 1000,
          position: [-17, -6, 6.5],
          up: [0, 0, 1],
        }}
      >
        <color attach="background" args={["black"]} />
        {/* <fog attach="fog" args={[0x110920, 50, 100]} /> */}
        <ambientLight />
        <Ground
          position-z={-2.5 * amplitude}
          mirror={1}
          blur={[500, 100]}
          mixBlur={12}
          mixStrength={1.5}
        />
        {isAudioMode() ? (
          <DataReactiveGrid amplitude={amplitude} dataRef={freqDataRef} />
        ) : (
          <WaveformGrid amplitude={amplitude} />
        )}
        <EffectComposer multisampling={8}>
          <Bloom
            kernelSize={3}
            luminanceThreshold={0}
            luminanceSmoothing={0.4}
            intensity={0.3}
          />
          <Bloom
            kernelSize={KernelSize.HUGE}
            luminanceThreshold={0}
            luminanceSmoothing={0}
            intensity={0.25}
          />
        </EffectComposer>
        <Stats />
        <OrbitControls />
      </Canvas>
    </Suspense>
  );
}

export default App;
