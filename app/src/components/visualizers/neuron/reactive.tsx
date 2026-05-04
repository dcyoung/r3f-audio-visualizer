import { useMemo } from "react";
import { type TVisualProps } from "@/components/visualizers/models";

import { buildNeuronSegments, NeuronModel } from "./base";
import { DepolarizationParticles } from "./depolarization";

const NeuronVisual = (props: TVisualProps) => {
  void props;
  const segments = useMemo(() => buildNeuronSegments(), []);

  return (
    <>
      <pointLight
        position={[0, 2.2, -5.5]}
        intensity={42}
        distance={28}
        decay={2}
        color="#8da2ff"
      />
      <directionalLight position={[0, 2, -5]} intensity={3.2} color="#b8c5ff" />
      <mesh position={[0, 0, -4.8]} scale={[8, 8, 1]} renderOrder={-1}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial
          color="#4f6cff"
          transparent={true}
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <NeuronModel segments={segments}>
        <DepolarizationParticles segments={segments} />
      </NeuronModel>
    </>
  );
};

export default NeuronVisual;
