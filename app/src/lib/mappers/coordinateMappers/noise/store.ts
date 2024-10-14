import { createConfigurableInstance } from "@/lib/storeHelpers";

import {
  CoordinateMapper_Noise,
  type TCoordinateMapper_NoiseParams,
} from "./mapper";

const { useActions, useInstance, usePresets } = createConfigurableInstance<
  CoordinateMapper_Noise,
  TCoordinateMapper_NoiseParams
>(new CoordinateMapper_Noise(), {
  default: CoordinateMapper_Noise.PRESETS.DEFAULT,
});

export { useActions, useInstance, usePresets };
