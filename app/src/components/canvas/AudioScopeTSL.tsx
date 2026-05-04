import "@/r3f-webgpu";

import ModalVisual from "@/components/visualizers/visualizerModal";
import { Canvas } from "@react-three/fiber/webgpu";
import * as THREE from "three/webgpu";

import { DebugStats } from "./DebugStats";
import { WebGPUPostProcessing } from "./webgpu/WebGPUPostProcessing";

const AudioScopeTSLCanvas = () => {
  return (
    <Canvas
      orthographic
      camera={{
        left: -1,
        right: 1,
        top: 1,
        bottom: -1,
        near: 0.1,
        far: 10,
        position: [0, 0, 5],
      }}
      renderer={{
        powerPreference: "high-performance",
        antialias: true,
        outputColorSpace: THREE.LinearSRGBColorSpace,
        toneMapping: THREE.NoToneMapping,
      }}
    >
      <color attach="background" args={["#010204"]} />
      <ModalVisual />
      <WebGPUPostProcessing strength={1.0} radius={0.4} threshold={0.2} />
      <DebugStats />
    </Canvas>
  );
};
export default AudioScopeTSLCanvas;
