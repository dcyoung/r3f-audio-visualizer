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
  updateWaveformCount: (n: number) => void;
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
      const update = [...get().coordinateMapper.waveFrequenciesHz];
      update[i] = value;
      get().coordinateMapper.waveFrequenciesHz = update;
      return { waveFrequenciesHz: get().coordinateMapper.waveFrequenciesHz };
    });
  },
  updateWaveformCount: (n: number) => {
    const prev = get().coordinateMapper.waveFrequenciesHz;
    const update = [
      ...prev.slice(0, n),
      ...new Array(Math.max(0, n - prev.length)).fill(0),
    ];
    get().coordinateMapper.waveFrequenciesHz = update;
  },
  data: defaultCoordinateMapperParams.data,
  resizeData: (n: number) =>
    set(() => {
      get().coordinateMapper.data = new Array<number>(n);
      return { data: get().coordinateMapper.data };
    }),
}));
