import { useMemo } from "react";
import { type TVisualProps } from "@/components/visualizers/models";

import { buildNeuronSegments, NeuronModel } from "./base";
import {
  DEFAULT_DEPOLARIZATION_BAND_WIDTH,
  DepolarizationParticles,
} from "./depolarization";
import {
  DEFAULT_SIM_TIME_SCALE,
  useNeuronSimulation,
} from "./useNeuronSimulation";

const NeuronVisual = (props: TVisualProps) => {
  void props;
  const segments = useMemo(() => buildNeuronSegments(), []);
  /** Higher = more sim-ms delay per world unit along the axon (slower apparent spread). */
  const conductionMsPerWorldUnit = 28;
  const { samplerRef } = useNeuronSimulation({
    stimulusKeyHold: true,
    simTimeScale: DEFAULT_SIM_TIME_SCALE,
    conductionMsPerWorldUnit,
    effluxLagMs: DEFAULT_DEPOLARIZATION_BAND_WIDTH * conductionMsPerWorldUnit * 0.55,
  });

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
        <DepolarizationParticles
          segments={segments}
          samplerRef={samplerRef}
          effluxEnabled
          effluxLagDistance={DEFAULT_DEPOLARIZATION_BAND_WIDTH * 0.55}
          effluxParticleFraction={0.35}
        />
      </NeuronModel>
    </>
  );
};

export default NeuronVisual;
