import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import {
  VISUAL_REGISTRY,
  type TVisualId,
} from "@/components/visualizers/registry";
import { APPLICATION_MODE } from "@/lib/applicationModes";

import { useModeContext } from "./mode";
import { useWaveGeneratorContextSetters } from "./waveGenerator";

interface VisualConfig {
  visual: TVisualId;
  colorBackground: boolean;
  paletteTrackEnergy: boolean;
}

export const VisualContext = createContext<{
  config: VisualConfig;
  setters: {
    setVisual: Dispatch<SetStateAction<TVisualId>>;
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
  const { mode } = useModeContext();
  const [visual, setVisual] = useState<TVisualId>(initial?.visual ?? "grid");
  const [colorBackground, setColorBackground] = useState<boolean>(
    initial?.colorBackground ?? true,
  );
  const [paletteTrackEnergy, setPaletteTrackEnergy] = useState<boolean>(
    initial?.paletteTrackEnergy ?? false,
  );
  const { setWaveformFrequenciesHz, setMaxAmplitude } =
    useWaveGeneratorContextSetters();

  // Reset waveform values whenever the visual changes
  useEffect(() => {
    if (mode === APPLICATION_MODE.WAVE_FORM) {
      switch (visual) {
        case "diffusedRing":
          setWaveformFrequenciesHz([2.0, 10.0]);
          setMaxAmplitude(1.0);
          break;
        default:
          setWaveformFrequenciesHz([2.0]);
          setMaxAmplitude(1.0);
          break;
      }
    }
  }, [visual, mode, setWaveformFrequenciesHz, setMaxAmplitude]);

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

  const VisualConfigProvider = useMemo(
    () => VISUAL_REGISTRY.get(visual).config?.provider ?? Fragment,
    [visual],
  );
  return (
    <VisualContext.Provider
      value={{
        config: {
          visual,
          colorBackground,
          paletteTrackEnergy,
        },
        setters: {
          setVisual,
          setColorBackground,
          setPaletteTrackEnergy,
        },
      }}
    >
      <VisualConfigProvider>{children}</VisualConfigProvider>
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
