import { createConfigurableInstance } from "@/lib/storeHelpers";

import {
  CoordinateMapper_WaveformSuperposition,
  type TSuperPositionParams,
} from "./mapper";

const { useActions, useInstance, usePresets } = createConfigurableInstance<
  CoordinateMapper_WaveformSuperposition,
  TSuperPositionParams
>(new CoordinateMapper_WaveformSuperposition(), {
  default: CoordinateMapper_WaveformSuperposition.PRESETS.DEFAULT,
});

export { useActions, useInstance, usePresets };
