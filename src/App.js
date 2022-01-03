import "./App.css";
// import Analyzer from './components/analyzer';
import WaveformGrid from "./components/waveformGrid";
// import DataReactiveGrid from './components/dataReactiveGrid';
import Ground from "./components/ground";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { KernelSize } from "postprocessing";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function App() {
  const amplitude = 1.0;
  // const freqDataRef = useRef();

  return (
    <Suspense fallback={<span>loading...</span>}>
      {/* <Analyzer freqDataRef={freqDataRef} /> */}
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
        <WaveformGrid amplitude={amplitude} />
        {/* <DataReactiveGrid amplitude={amplitude} dataRef={freqDataRef} /> */}
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
