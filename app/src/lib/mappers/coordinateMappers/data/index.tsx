import ControlsComponent from "./controls";
import { useActions, useInstance, usePresets } from "./store";

export default {
  id: "data",
  ControlsComponent,
  hooks: {
    useActions,
    useInstance,
    usePresets,
  },
} as const;
