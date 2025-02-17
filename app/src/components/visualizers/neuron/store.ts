import { create } from "zustand";

import { HHModel, type TStepData } from "./model";
import { RingBuffer } from "./ring-buffer";

type TNeuronStore = {
  model: HHModel;
  history: RingBuffer<TStepData>;
  stimulusCurrent: number;
  actions: {
    setStimulusCurrent: (current: number) => void;
    step: (tDeltaMs: number) => void;
  };
};
const useStore = create<TNeuronStore>()((set) => ({
  model: new HHModel(0),
  stimulusCurrent: 0,
  history: new RingBuffer<TStepData>(500),
  actions: {
    step: (tDeltaMs: number) => {
      const { model, stimulusCurrent, history } = useStore.getState();
      const data = model.step(tDeltaMs, stimulusCurrent);
      history.add(data);
    },
    setStimulusCurrent: (v: number) =>
      set(() => ({
        stimulusCurrent: v,
      })),
  },
}));

export const useHistory = () => useStore((state) => state.history);
export const useActions = () => useStore((state) => state.actions);
