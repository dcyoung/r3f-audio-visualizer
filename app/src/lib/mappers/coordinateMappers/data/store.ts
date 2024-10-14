import { createConfigurableInstance } from "@/lib/storeHelpers";

import {
  CoordinateMapper_Data,
  type TCoordinateMapper_DataParams,
} from "./mapper";

const { useActions, useInstance, usePresets } = createConfigurableInstance<
  CoordinateMapper_Data,
  TCoordinateMapper_DataParams
>(new CoordinateMapper_Data(), {
  default: CoordinateMapper_Data.PRESETS.DEFAULT,
});

export { useActions, useInstance, usePresets };
