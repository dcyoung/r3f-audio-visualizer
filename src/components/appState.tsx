import create from "zustand";

interface IAppState {
  audioContext: AudioContext;
  visualSourceData: {
    x: Float32Array;
    y: Float32Array;
    z: Float32Array;
  };
  energyInfo: {
    current: number;
  };
  actions: {
    resizeVisualSourceData: (newSize: number) => void;
  };
}

const useAppState = create<IAppState>((set, get) => ({
  audioContext: new window.AudioContext(),
  visualSourceData: {
    x: new Float32Array(121).fill(0),
    y: new Float32Array(121).fill(0),
    z: new Float32Array(121).fill(0),
  },
  energyInfo: { current: 0 },
  actions: {
    resizeVisualSourceData: (newSize: number) =>
      set((state) => {
        return {
          visualSourceData: {
            x: new Float32Array(newSize).fill(0),
            y: new Float32Array(newSize).fill(0),
            z: new Float32Array(newSize).fill(0),
          },
        };
      }),
  },
}));

export const useAudioContext = () => useAppState((state) => state.audioContext);
export const useVisualSourceDataX = () =>
  useAppState((state) => state.visualSourceData.x);
export const useVisualSourceDataY = () =>
  useAppState((state) => state.visualSourceData.y);
export const useVisualSourceDataZ = () =>
  useAppState((state) => state.visualSourceData.z);
export const useEnergyInfo = () => useAppState((state) => state.energyInfo);
export const useAppStateActions = () => useAppState((state) => state.actions);
