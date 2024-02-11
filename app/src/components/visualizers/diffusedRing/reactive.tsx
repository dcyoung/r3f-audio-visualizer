import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { useRingVisualConfigContext } from "@/context/visualConfig/diffusedRing";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { Vector3 } from "three";

import BaseDiffusedRing from "./base";

const DiffusedRingVisual = ({ coordinateMapper }: VisualProps) => {
  const { radius, pointSize, mirrorEffects } = useRingVisualConfigContext();

  return (
    <>
      <BaseDiffusedRing
        coordinateMapper={coordinateMapper}
        radius={radius}
        pointSize={pointSize}
        mirrorEffects={mirrorEffects}
      />
      <Ground position={new Vector3(0, 0, -1.5 * coordinateMapper.amplitude)} />
    </>
  );
};

const ComposeDiffusedRingVisual = ({ ...props }: VisualProps) => {
  return (
    <>
      <DiffusedRingVisual {...props} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={1} height={300} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </>
  );
};

export default ComposeDiffusedRingVisual;
