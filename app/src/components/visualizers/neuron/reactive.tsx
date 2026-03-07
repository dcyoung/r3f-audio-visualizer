import { TSLBloomPostProcessing } from "@/components/canvas/webgpu/TSLPostProcessing";
import Ground from "@/components/visualizers/ground";
import { type TVisualProps } from "@/components/visualizers/models";
import { Vector3 } from "three";

import BaseVisual from "./base";

export default ({ coordinateMapper }: TVisualProps) => {
  return (
    <>
      <BaseVisual coordinateMapper={coordinateMapper} />
      <Ground position={new Vector3(0, 0, -2)} />
      <TSLBloomPostProcessing
        bloomStrength={0.7}
        bloomRadius={0.4}
        bloomThreshold={0.1}
        noiseIntensity={0.01}
        vignetteOffset={0.1}
        vignetteDarkness={0.8}
      />
    </>
  );
};
