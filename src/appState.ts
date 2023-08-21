import { create } from "zustand";

import { getRadioStations } from "./radio";

export interface RadioStation {
  title: string;
  streamUrl: string;
}

interface IAppState {
  radioStations: RadioStation[] | null;
  visualSourceData: {
    x: Float32Array;
    y: Float32Array;
    // z: Float32Array;
  };
  energyInfo: {
    current: number;
  };
  actions: {
    resizeVisualSourceData: (newSize: number) => void;
  };
}

const useAppState = create<IAppState>((set, _) => ({
  radioStations: null,
  visualSourceData: {
    x: new Float32Array(121).fill(0),
    y: new Float32Array(121).fill(0),
    // z: new Float32Array(121).fill(0),
  },
  energyInfo: { current: 0 },
  actions: {
    resizeVisualSourceData: (newSize: number) =>
      set((_) => {
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

export const useAvailableRadioStations = () =>
  useAppState((state) => state.radioStations);
export const useVisualSourceDataX = () =>
  useAppState((state) => state.visualSourceData.x);
export const useVisualSourceDataY = () =>
  useAppState((state) => state.visualSourceData.y);
// export const useVisualSourceDataZ = () =>
//   useAppState((state) => state.visualSourceData.z);
export const useEnergyInfo = () => useAppState((state) => state.energyInfo);
export const useAppStateActions = () => useAppState((state) => state.actions);


getRadioStations().then((stations) => useAppState.setState({ radioStations: stations })).catch((e) => console.error(e));