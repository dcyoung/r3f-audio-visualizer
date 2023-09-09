import { folder, useControls } from "leva";

import ParticleSwarmVisual from "@/components/visualizers/particleSwarm/reactive";
import { MotionMapper_Noise } from "@/lib/mappers/motionMappers/curlNoise";

const ParticleNoiseVisual = () => {
  const { spatialScale, curlAmount } = useControls({
    "Particle Noise Generator": folder({
      spatialScale: {
        value: 2.0,
        min: 0.1,
        max: 5.0,
        step: 0.1,
      },
      curlAmount: {
        value: 0.5,
        min: 0.01,
        max: 1.0,
        step: 0.01,
      },
    }),
  });

  const motionMapper = new MotionMapper_Noise(spatialScale, curlAmount);
  return <ParticleSwarmVisual motionMapper={motionMapper} />;
};

export default ParticleNoiseVisual;
