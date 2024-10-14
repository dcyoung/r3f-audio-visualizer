import ControlsComponent from "./controls";
import { useActions, useInstance, usePresets } from "./store";

export default {
  id: "waveform",
  ControlsComponent,
  hooks: {
    useActions,
    useInstance,
    usePresets,
  },
} as const;
