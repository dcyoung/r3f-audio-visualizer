import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import {
  VISUAL_REGISTRY,
  type TVisual,
  type TVisualId,
} from "@/components/visualizers/registry";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import { useAppStateActions, useMode } from "@/lib/appState";
import { CoordinateMapper_Data } from "@/lib/mappers/coordinateMappers/data";
import { CoordinateMapper_Noise } from "@/lib/mappers/coordinateMappers/noise";
import { CoordinateMapper_WaveformSuperposition } from "@/lib/mappers/coordinateMappers/waveform";
import { TextureMapper } from "@/lib/mappers/textureMappers/textureMapper";

interface VisualConfig {
  visual: TVisual;
  colorBackground: boolean;
  paletteTrackEnergy: boolean;
}

export const VisualContext = createContext<{
  config: VisualConfig;
  setters: {
    setVisualId: (id: TVisualId) => void;
    setColorBackground: Dispatch<SetStateAction<boolean>>;
    setPaletteTrackEnergy: Dispatch<SetStateAction<boolean>>;
  };
} | null>(null);

export const VisualContextProvider = ({
  initial,
  children,
}: PropsWithChildren<{
  initial?: Partial<VisualConfig>;
}>) => {
  const mode = useMode();
  const [visual, setVisual] = useState<TVisual>(
    initial?.visual ?? VISUAL_REGISTRY.grid,
  );
  const setVisualId = useCallback(
    (id: TVisualId) => {
      setVisual(VISUAL_REGISTRY[id]);
    },
    [setVisual],
  );
  const [colorBackground, setColorBackground] = useState<boolean>(
    initial?.colorBackground ?? true,
  );
  const [paletteTrackEnergy, setPaletteTrackEnergy] = useState<boolean>(
    initial?.paletteTrackEnergy ?? false,
  );

  const { setMappers } = useAppStateActions();

  // Reset waveform values whenever the visual changes
  useEffect(() => {
    switch (visual.id) {
      case "diffusedRing":
        setMappers({
          textureMapper: new TextureMapper(),
          coordinateMapperWaveform: new CoordinateMapper_WaveformSuperposition(
            CoordinateMapper_WaveformSuperposition.PRESETS.DOUBLE,
          ),
          coordinateMapperData: new CoordinateMapper_Data(),
          coordinateMapperNoise: new CoordinateMapper_Noise(),
        });
        break;
      default:
        setMappers({
          textureMapper: new TextureMapper(),
          coordinateMapperWaveform:
            new CoordinateMapper_WaveformSuperposition(),
          coordinateMapperData: new CoordinateMapper_Data(),
          coordinateMapperNoise: new CoordinateMapper_Noise(),
        });
        break;
    }
  }, [visual, setMappers]);

  // Reset paletteTrackEnergy whenever the mode changes
  useEffect(() => {
    switch (mode) {
      case APPLICATION_MODE.WAVE_FORM:
      case APPLICATION_MODE.NOISE:
      case APPLICATION_MODE.AUDIO_SCOPE:
      case APPLICATION_MODE.PARTICLE_NOISE:
        setPaletteTrackEnergy(false);
        break;
      case APPLICATION_MODE.AUDIO:
        setPaletteTrackEnergy(true);
        break;
      default:
        return mode satisfies never;
    }
  }, [mode, setPaletteTrackEnergy]);

  return (
    <VisualContext.Provider
      value={{
        config: {
          visual,
          colorBackground,
          paletteTrackEnergy,
        },
        setters: {
          setVisualId,
          setColorBackground,
          setPaletteTrackEnergy,
        },
      }}
    >
      {children}
    </VisualContext.Provider>
  );
};

export function useVisualContext() {
  const context = useContext(VisualContext);
  if (!context) {
    throw new Error(
      "useVisualContext must be used within a VisualContextProvider",
    );
  }
  return context.config;
}

export function useVisualContextSetters() {
  const context = useContext(VisualContext);
  if (!context) {
    throw new Error(
      "useVisualContext must be used within a VisualContextProvider",
    );
  }
  return context.setters;
}
