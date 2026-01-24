import { PropsWithChildren } from "react";
import { Environment } from "@react-three/drei";
import { Canvas, extend, ThreeToJSXElements } from "@react-three/fiber";
import * as THREE from "three/webgpu";

import { WebGPUPostProcessing } from "./WebGPUPostProcessing";

declare module "@react-three/fiber" {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

extend(THREE as any);

export const WebGPUCanvas3D = ({ children }: PropsWithChildren) => {
  const quality = "default";
  return (
    <Canvas
      dpr={quality === "default" ? 1 : [1, 1.5]}
      shadows={"variance"}
      camera={{
        fov: 45,
        near: 1,
        far: 1000,
        position: [-17, -6, 6.5],
        up: [0, 0, 1],
      }}
      linear={true}
      gl={async (props) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
        const renderer = new THREE.WebGPURenderer({
          ...(props as any),
          powerPreference: "high-performance",
          antialias: false,
          alpha: false,
          stencil: false,
        });
        await renderer.init();
        return renderer;
      }}
    >
      <WebGPUPostProcessing />
      <Environment
        preset="warehouse"
        environmentIntensity={0.2}
        environmentRotation={[0.4, 0, 1.4]}
      />
      {children}
    </Canvas>
  );
};
