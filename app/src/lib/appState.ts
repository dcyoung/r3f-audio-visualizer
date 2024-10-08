import { TextureMapper } from "@/components/visualizers/audioScope/base";
import { create } from "zustand";

import { APPLICATION_MODE } from "./applicationModes";
import { EventDetector } from "./eventDetector";
import { CoordinateMapper_Data } from "./mappers/coordinateMappers/data";
import { CoordinateMapper_Modal } from "./mappers/coordinateMappers/modal";
import { type IScalarTracker } from "./mappers/valueTracker/common";
import { EnergyTracker } from "./mappers/valueTracker/energyTracker";
import {
  AVAILABLE_COLOR_PALETTES,
  COLOR_PALETTE,
  type ColorPaletteType,
} from "./palettes";

type TApplicationMode =
  | typeof APPLICATION_MODE.WAVE_FORM
  | typeof APPLICATION_MODE.NOISE
  | typeof APPLICATION_MODE.AUDIO;

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
    coordinateMapper: CoordinateMapper_Modal;
    energyTracker: IScalarTracker | null;
  };
  actions: {
    setMode: (newMode: TApplicationMode) => void;
    noteCanvasInteraction: () => void;
    setPalette: (newPalette: ColorPaletteType) => void;
    nextPalette: () => void;
    resizeVisualSourceData: (newSize: number) => void;
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
    textureMapper: new TextureMapper(
      new Float32Array(512).fill(0), //timeSamples,
      new Float32Array(512).fill(0), //quadSamples
    ),
    coordinateMapper: new CoordinateMapper_Modal(),
    energyTracker: new EnergyTracker(0),
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
    resizeVisualSourceData: (newSize: number) =>
      set((state) => {
        state.mappers.coordinateMapper.update(
          APPLICATION_MODE.AUDIO,
          new CoordinateMapper_Data(1.0, new Float32Array(newSize).fill(0)),
        );
        return {
          mappers: {
            ...state.mappers,
            textureMapper: new TextureMapper(
              new Float32Array(newSize).fill(0), // time samples
              new Float32Array(newSize).fill(0), // quad samples
            ),
          },
        };
      }),
    setMode: (newMode: TApplicationMode) =>
      set((state) => {
        state.mappers.coordinateMapper.setMode(newMode);
        return {
          mode: newMode,
          mappers: {
            ...state.mappers,
            energyTracker:
              newMode === APPLICATION_MODE.AUDIO ? new EnergyTracker(0) : null,
          },
        };
      }),
    // setCoordinateMapper: (newMapper: ICoordinateMapper) =>
    //   set((state) => {
    //     state.drivers.coordinateMapper.set(newMapper);
    //     return {};
    //   }),
  },
}));

export const useMode = () => useAppState((state) => state.mode);
export const useUser = () => useAppState((state) => state.user);
export const usePalette = () => useAppState((state) => state.visual.palette);
export const useTextureMapper = () =>
  useAppState((state) => state.mappers.textureMapper);
export const useCoordinateMapper = () =>
  useAppState((state) => state.mappers.coordinateMapper);
export const useEnergyTracker = () =>
  useAppState((state) => state.mappers.energyTracker);
export const useAppStateActions = () => useAppState((state) => state.actions);
