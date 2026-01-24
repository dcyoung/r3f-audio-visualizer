import { PropsWithChildren } from "react";
import { Canvas } from "@react-three/fiber";

export const WegGLCanvas3D = ({ children }: PropsWithChildren) => {
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 1,
        far: 1000,
        position: [-17, -6, 6.5],
        up: [0, 0, 1],
      }}
      linear={true}
    >
      {children}
    </Canvas>
  );
};
