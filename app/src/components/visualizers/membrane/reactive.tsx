import { TSLBloomPostProcessing } from "@/components/canvas/webgpu/TSLPostProcessing";
import { type TVisualProps } from "@/components/visualizers/models";

import BaseVisual from "./base";

export default ({ coordinateMapper }: TVisualProps) => {
  return (
    <>
      <BaseVisual coordinateMapper={coordinateMapper} />
      <TSLBloomPostProcessing
        bloomStrength={0.4}
        bloomRadius={0.3}
        bloomThreshold={0.3}
        noiseIntensity={0.01}
        vignetteOffset={0.1}
        vignetteDarkness={0.9}
      />
    </>
  );
};
