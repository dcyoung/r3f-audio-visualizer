import {
  getPlatformSupportedAudioSources,
  type TAudioSource,
} from "@/components/audio/sourceControls/common";
import {
  VISUAL_REGISTRY,
  type TVisual,
  type TVisualId,
} from "@/components/visualizers/registry";
import { create } from "zustand";

import { type EnergyMeasure, type OctaveBandMode } from "./analyzers/fft";
import { APPLICATION_MODE, type TApplicationMode } from "./applicationModes";
import { EventDetector } from "./eventDetector";
import { CoordinateMapper_Data } from "./mappers/coordinateMappers/data/mapper";
import { CoordinateMapper_Noise } from "./mappers/coordinateMappers/noise/mapper";
import { CoordinateMapper_WaveformSuperposition } from "./mappers/coordinateMappers/waveform/mapper";
import { type IMotionMapper } from "./mappers/motionMappers/common";
import { MotionMapper_Noise } from "./mappers/motionMappers/curlNoise";
import { TextureMapper } from "./mappers/textureMappers/textureMapper";
import {
  NoOpScalarTracker,
  type IScalarTracker,
} from "./mappers/valueTracker/common";
import { EnergyTracker } from "./mappers/valueTracker/energyTracker";
import {
  AVAILABLE_COLOR_PALETTES,
  COLOR_PALETTE,
  type ColorPaletteType,
} from "./palettes";

interface IAppearanceState {
  showUI: boolean;
  palette: ColorPaletteType;
  paletteTrackEnergy: boolean;
  colorBackground: boolean;
}
interface ICameraState {
  mode: "AUTO_ORBIT" | "ORBIT_CONTROLS";
  autoOrbitAfterSleepMs: number; // disabled if <= 0
}
interface IMappersState {
  textureMapper: TextureMapper;
  motionMapper: IMotionMapper;
  // coordinateMapperWaveform: CoordinateMapper_WaveformSuperposition;
  // coordinateMapperNoise: CoordinateMapper_Noise;
  // coordinateMapperData: CoordinateMapper_Data;
  energyTracker: IScalarTracker | null;
}
interface IAudioState {
  source: TAudioSource;
}
interface IAnalyzersState {
  fft: {
    octaveBandMode: OctaveBandMode;
    energyMeasure: EnergyMeasure;
  };
}

interface IAppState {
  user: {
    canvasInteractionEventTracker: EventDetector;
  };
  visual: TVisual;
  appearance: IAppearanceState;
  camera: ICameraState;
  mode: TApplicationMode;
  mappers: IMappersState;
  audio: IAudioState;
  analyzers: IAnalyzersState;
  actions: {
    setMode: (newMode: TApplicationMode) => void;
    setAudio: (newAudio: Partial<IAudioState>) => void;
    setVisual: (newVisualId: TVisualId) => void;
    setCamera: (newCamera: Partial<ICameraState>) => void;
    noteCanvasInteraction: () => void;
    setAppearance: (newAppearance: Partial<IAppearanceState>) => void;
    nextPalette: () => void;
    setMappers: (newMappers: Partial<IMappersState>) => void;
    setAnalyzerFFT: (newAnalyzer: Partial<IAnalyzersState["fft"]>) => void;
  };
}

const useAppState = create<IAppState>((set) => ({
  user: {
    canvasInteractionEventTracker: new EventDetector(),
  },
  visual: VISUAL_REGISTRY.grid,
  appearance: {
    palette: COLOR_PALETTE.THREE_COOL_TO_WARM,
    colorBackground: true,
    paletteTrackEnergy: false,
    showUI: true,
  },
  camera: {
    mode: "ORBIT_CONTROLS",
    autoOrbitAfterSleepMs: 10000,
  },
  analyzers: {
    fft: {
      octaveBandMode: 2,
      energyMeasure: "bass",
    },
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
  audio: {
    source: getPlatformSupportedAudioSources()[0],
  },
  actions: {
    setVisual: (newVisualId: TVisualId) =>
      set((state) => {
        const newVisual = VISUAL_REGISTRY[newVisualId];
        return [...newVisual.supportedApplicationModes].includes(state.mode)
          ? {
              visual: newVisual,
              // mappers values whenever the visual changes
              mappers: {
                ...state.mappers,
                textureMapper: new TextureMapper(),
              },
            }
          : {};
      }),
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
    setAppearance: (newAppearance: Partial<IAppearanceState>) =>
      set((state) => {
        return {
          appearance: {
            ...state.appearance,
            ...newAppearance,
          },
        };
      }),
    nextPalette: () =>
      set((state) => {
        const currIdx =
          AVAILABLE_COLOR_PALETTES.indexOf(state.appearance.palette) ?? 0;
        const nextIdx = (currIdx + 1) % AVAILABLE_COLOR_PALETTES.length;
        return {
          appearance: {
            ...state.appearance,
            palette: AVAILABLE_COLOR_PALETTES[nextIdx],
          },
        };
      }),
    setMode: (newMode: TApplicationMode) =>
      set((state) => {
        return {
          mode: newMode,
          ...(![...state.visual.supportedApplicationModes].includes(newMode)
            ? {
                visual: Object.values(VISUAL_REGISTRY).find((v) =>
                  [...v.supportedApplicationModes].includes(newMode),
                ),
              }
            : {}),
          mappers: {
            ...state.mappers,
            energyTracker:
              newMode === APPLICATION_MODE.AUDIO
                ? new EnergyTracker(0)
                : NoOpScalarTracker,
          },
          appearance: {
            ...state.appearance,
            // Reset paletteTrackEnergy whenever the mode changes
            paletteTrackEnergy: newMode === APPLICATION_MODE.AUDIO,
            // Set default appearance settings for audio scope mode
            ...(newMode === APPLICATION_MODE.AUDIO_SCOPE
              ? {
                  palette: "rainbow",
                }
              : {}),
          },
        };
      }),
    setMappers: (newMappers: Partial<IMappersState>) =>
      set((state) => ({
        mappers: {
          ...state.mappers,
          ...newMappers,
        },
      })),
    setAudio: (newAudio: Partial<IAudioState>) =>
      set((state) => ({
        audio: {
          ...state.audio,
          ...newAudio,
        },
      })),
    setCamera: (newCamera: Partial<ICameraState>) =>
      set((state) => ({
        camera: {
          ...state.camera,
          ...newCamera,
        },
      })),
    setAnalyzerFFT: (newAnalyzer: Partial<IAnalyzersState["fft"]>) =>
      set((state) => ({
        analyzers: {
          ...state.analyzers,
          fft: {
            ...state.analyzers.fft,
            ...newAnalyzer,
          },
        },
      })),
  },
}));

export const useAnalyzerFFT = () => useAppState((state) => state.analyzers.fft);
export const useCameraState = () => useAppState((state) => state.camera);
export const useVisual = () => useAppState((state) => state.visual);
export const useAppearance = () => useAppState((state) => state.appearance);
export const usePalette = () =>
  useAppState((state) => state.appearance.palette);
export const useMode = () => useAppState((state) => state.mode);
export const useUser = () => useAppState((state) => state.user);
export const useMappers = () => useAppState((state) => state.mappers);
export const useAudio = () => useAppState((state) => state.audio);
export const useAppStateActions = () => useAppState((state) => state.actions);
