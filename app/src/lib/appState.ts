import { create } from "zustand";

import { EventDetector } from "./eventDetector";
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
  visualSourceData: {
    x: Float32Array;
    y: Float32Array;
  };
  energyInfo: {
    current: number;
  };
  actions: {
    noteCanvasInteraction: () => void;
    setPalette: (newPalette: ColorPaletteType) => void;
    nextPalette: () => void;
    resizeVisualSourceData: (newSize: number) => void;
  };
}

const useAppState = create<IAppState>((set, _) => ({
  user: {
    canvasInteractionEventTracker: new EventDetector(),
  },
  visual: {
    palette: COLOR_PALETTE.THREE_COOL_TO_WARM,
  },
  visualSourceData: {
    x: new Float32Array(121).fill(0),
    y: new Float32Array(121).fill(0),
  },
  energyInfo: { current: 0 },
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
      set((_) => {
        return {
          visualSourceData: {
            x: new Float32Array(newSize).fill(0),
            y: new Float32Array(newSize).fill(0),
          },
        };
      }),
  },
}));

export const useUser = () => useAppState((state) => state.user);
export const usePalette = () => useAppState((state) => state.visual.palette);
export const useVisualSourceDataX = () =>
  useAppState((state) => state.visualSourceData.x);
export const useVisualSourceDataY = () =>
  useAppState((state) => state.visualSourceData.y);
export const useEnergyInfo = () => useAppState((state) => state.energyInfo);
export const useAppStateActions = () => useAppState((state) => state.actions);
