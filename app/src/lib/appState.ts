import { create } from "zustand";

import { APPLICATION_MODE, type TApplicationMode } from "./applicationModes";
import { EventDetector } from "./eventDetector";
import { CoordinateMapper_Data } from "./mappers/coordinateMappers/data";
import { CoordinateMapper_Noise } from "./mappers/coordinateMappers/noise";
import { CoordinateMapper_WaveformSuperposition } from "./mappers/coordinateMappers/waveform";
import { type IMotionMapper } from "./mappers/motionMappers/common";
import { MotionMapper_Noise } from "./mappers/motionMappers/curlNoise";
import { TextureMapper } from "./mappers/textureMappers/textureMapper";
import { EnergyTracker } from "./mappers/valueTracker/energyTracker";
import {
  AVAILABLE_COLOR_PALETTES,
  COLOR_PALETTE,
  type ColorPaletteType,
} from "./palettes";

interface IAppState {
  user: {
    canvasInteractionEventTracker: EventDetector;
  };
  visual: {
    palette: ColorPaletteType;
  };
  mode: TApplicationMode;
  mappers: {
    textureMapper: TextureMapper;
    motionMapper: IMotionMapper;
    coordinateMapperWaveform: CoordinateMapper_WaveformSuperposition;
    coordinateMapperNoise: CoordinateMapper_Noise;
    coordinateMapperData: CoordinateMapper_Data;
    energyTracker: EnergyTracker | null;
  };
  actions: {
    setMode: (newMode: TApplicationMode) => void;
    noteCanvasInteraction: () => void;
    setPalette: (newPalette: ColorPaletteType) => void;
    nextPalette: () => void;
    setMappers: (newMappers: Partial<IAppState["mappers"]>) => void;
  };
}

const useAppState = create<IAppState>((set) => ({
  user: {
    canvasInteractionEventTracker: new EventDetector(),
  },
  visual: {
    palette: COLOR_PALETTE.THREE_COOL_TO_WARM,
  },
  mode: APPLICATION_MODE.WAVE_FORM,
  mappers: {
    textureMapper: new TextureMapper(),
    coordinateMapperWaveform: new CoordinateMapper_WaveformSuperposition(),
    coordinateMapperNoise: new CoordinateMapper_Noise(),
    coordinateMapperData: new CoordinateMapper_Data(),
    energyTracker: new EnergyTracker(0),
    motionMapper: new MotionMapper_Noise(2.0, 0.5),
  },
  actions: {
    noteCanvasInteraction: () =>
      set((state) => {
        state.user.canvasInteractionEventTracker.addEvent();
        return {
          user: {
            canvasInteractionEventTracker:
              state.user.canvasInteractionEventTracker,
          },
        };
      }),
    setPalette: (newPalette: ColorPaletteType) =>
      set((_) => {
        return {
          visual: { palette: newPalette },
        };
      }),
    nextPalette: () =>
      set((state) => {
        const currIdx =
          AVAILABLE_COLOR_PALETTES.indexOf(state.visual.palette) ?? 0;
        const nextIdx = (currIdx + 1) % AVAILABLE_COLOR_PALETTES.length;
        return {
          visual: { palette: AVAILABLE_COLOR_PALETTES[nextIdx] },
        };
      }),
    setMode: (newMode: TApplicationMode) =>
      set(() => {
        return {
          mode: newMode,
        };
      }),
    setMappers: (newMappers: Partial<IAppState["mappers"]>) =>
      set((state) => ({
        mappers: {
          ...state.mappers,
          ...newMappers,
        },
      })),
  },
}));

export const useMode = () => useAppState((state) => state.mode);
export const useUser = () => useAppState((state) => state.user);
export const usePalette = () => useAppState((state) => state.visual.palette);
export const useMappers = () => useAppState((state) => state.mappers);
export const useAppStateActions = () => useAppState((state) => state.actions);
