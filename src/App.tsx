import './App.css';
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import DataReactiveGrid from "./components/dataReactiveGrid";
import WaveformGrid from "./components/waveformGrid";
import Ground from "./components/ground";
import { useControls, Leva } from "leva";
import * as THREE from "three";
import { APPLICATION_MODE_LIVE_STREAM, APPLICATION_MODE_MICROPHONE, APPLICATION_MODE_WAVE_FORM, getSupportedApplicationModes, isAudioMode } from './components/application_modes';
import AnaylzerLivestream from './components/analyzerLivestream';
import AnalyzerMic from './components/analyzerMic';

const App = (): JSX.Element => {
  const { mode, amplitude } = useControls({
    mode: { value: APPLICATION_MODE_WAVE_FORM, options: getSupportedApplicationModes() },
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
  }
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
        {/* <color attach="background" args={["black"]} /> */}
        <color attach="background" args={['#191920']} />
        <ambientLight />
        <fog attach="fog" args={['#191920', 0, 100]} />
        {/* <Environment preset="city" /> */}
        <Ground
          position={new THREE.Vector3(0, 0, -2.5 * amplitude)}
        />
        {
          isAudioMode(mode)
            ? <DataReactiveGrid amplitude={amplitude} dataRef={freqDataRef} />
            : <WaveformGrid amplitude={amplitude} />
        }
        <Stats />
        <OrbitControls />
      </Canvas>
      <Leva collapsed={true} />
    </Suspense>
  );
}

export default App;