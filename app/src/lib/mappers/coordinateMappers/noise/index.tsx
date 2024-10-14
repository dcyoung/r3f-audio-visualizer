import ControlsComponent from "./controls";
import { useActions, useInstance, usePresets } from "./store";

export default {
  id: "noise",
  ControlsComponent,
  hooks: {
    useActions,
    useInstance,
    usePresets,
  },
} as const;
