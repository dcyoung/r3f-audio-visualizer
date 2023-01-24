import create from "zustand";

interface IAppState {
  freqData: number[];
  energyInfo: {
    current: number;
  };
  actions: {
    resizeFreqData: (newSize: number) => void;
  };
}

const useAppState = create<IAppState>((set, get) => ({
  freqData: new Array<number>(121).fill(0),
  energyInfo: { current: 0 },
  actions: {
    resizeFreqData: (newSize: number) =>
      set((state) => {
        return { freqData: new Array<number>(newSize).fill(0) };
      }),
  },
}));

export const useFreqData = () => useAppState((state) => state.freqData);
export const useEnergyInfo = () => useAppState((state) => state.energyInfo);
export const useAppStateActions = () => useAppState((state) => state.actions);
