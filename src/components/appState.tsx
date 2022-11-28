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
  updateNumberActiveWaves: (n: number) => void;
  waveFrequenciesHz: number[];
  updateFrequencyHzAt: (i: number, value: number) => void;
  data: number[];
  resizeData: (n: number) => void;
}

const defaultCoordinateMapperParams = {
  mappingType: EMappingSourceType.Waveform,
  inputCoordinateType: ECoordinateType.Cartesian_2D,
  amplitude: 1.0,
  waveFrequenciesHz: [2.0],
  data: new Array<number>(121),
};

export const useAppState = create<IAppState>((set, get) => ({
  coordinateMapper: new CoordinateMapper_Multi(defaultCoordinateMapperParams),
  amplitude: defaultCoordinateMapperParams.amplitude,
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
  waveFrequenciesHz: defaultCoordinateMapperParams.waveFrequenciesHz,
  updateFrequencyHzAt: (i: number, value: number) => {
    set(() => {
      if (i >= get().waveFrequenciesHz.length) {
        return {};
      }
      const update = [...get().waveFrequenciesHz];
      update[i] = value;
      get().coordinateMapper.waveFrequenciesHz = update;
      return { waveFrequenciesHz: get().coordinateMapper.waveFrequenciesHz };
    });
  },
  updateNumberActiveWaves: (n: number) => {
    set(() => {
      const reference = [2.0, 10.0, 20.0];
      const update = [
        ...reference.slice(0, n),
        ...new Array(Math.max(0, n - reference.length)).fill(0),
      ];
      get().coordinateMapper.waveFrequenciesHz = update;
      return { waveFrequenciesHz: get().coordinateMapper.waveFrequenciesHz };
    });
  },
  data: defaultCoordinateMapperParams.data,
  resizeData: (n: number) =>
    set(() => {
      get().coordinateMapper.data = new Array<number>(n);
      return { data: get().coordinateMapper.data };
    }),
}));
