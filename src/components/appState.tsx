import create from "zustand";
import {
  CoordinateMapper_Multi,
  ECoordinateType,
  EMappingSourceType,
} from "./coordinateMapper";

interface IAppState {
  coordinateMapper: CoordinateMapper_Multi;
  updateMappingType: (value: EMappingSourceType) => void;
  updateCoordinateType: (value: ECoordinateType) => void;
  amplitude: number;
  updateAmplitude: (value: number) => void;
  updateFrequencyHz: (value: number) => void;
  data: number[];
  resizeData: (n: number) => void;
}

export const useAppState = create<IAppState>((set, get) => ({
  coordinateMapper: new CoordinateMapper_Multi(),
  amplitude: 1.0,
  updateMappingType: (value: EMappingSourceType) => {
    get().coordinateMapper.mappingType = value;
  },
  updateCoordinateType: (value: ECoordinateType) => {
    get().coordinateMapper.inputCoordinateType = value;
  },
  updateAmplitude: (value: number) => {
    set(() => {
      get().coordinateMapper.amplitude = value;
      return { amplitude: get().coordinateMapper.amplitude };
    });
  },
  updateFrequencyHz: (value: number) => {
    get().coordinateMapper.frequencyHz = value;
  },
  data: [],
  resizeData: (n: number) =>
    set(() => {
      get().coordinateMapper.data = new Array(n);
      return { data: get().coordinateMapper.data };
    }),
}));
