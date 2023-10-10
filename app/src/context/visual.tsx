import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
} from "react";
import { SRGBColorSpace } from "three";

import {
  AVAILABLE_VISUALS,
  type VisualType,
} from "@/components/visualizers/common";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import {
  type AVAILABLE_COLOR_PALETTES,
  COLOR_PALETTE,
  ColorPalette,
} from "@/lib/palettes";

import { useModeContext } from "./mode";
import { useTheme } from "./theme";
import { CombinedVisualsConfigContextProvider } from "./visualConfig/combined";
import { useWaveGeneratorContextSetters } from "./waveGenerator";

type Palette = (typeof AVAILABLE_COLOR_PALETTES)[number];
export interface VisualConfig {
  visual: VisualType;
  palette: Palette;
  colorBackground: boolean;
  paletteTrackEnergy: boolean;
}

export const VisualContext = createContext<{
  config: VisualConfig;
  setters: {
    resetConfig: Dispatch<void>;
    setVisual: Dispatch<SetStateAction<VisualType>>;
    setPalette: Dispatch<SetStateAction<Palette>>;
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
  const { setTheme } = useTheme();
  const { mode } = useModeContext();
  const [key, setKey] = useState<number>(0); // used to reset the context
  const [visual, setVisual] = useState<VisualType>(
    initial?.visual ?? AVAILABLE_VISUALS[0]
  );
  const [palette, setPalette] = useState<Palette>(
    initial?.palette ?? COLOR_PALETTE.THREE_COOL_TO_WARM
  );
  const [colorBackground, setColorBackground] = useState<boolean>(
    initial?.colorBackground ?? true
  );
  const [paletteTrackEnergy, setPaletteTrackEnergy] = useState<boolean>(
    initial?.paletteTrackEnergy ?? false
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

  useEffect(() => {
    if (!colorBackground) {
      setTheme("dark");
      return;
    }

    const bgColor = ColorPalette.getPalette(palette).calcBackgroundColor(0);
    const bgHsl = { h: 0, s: 0, l: 0 };
    bgColor.getHSL(bgHsl, SRGBColorSpace);
    setTheme(bgHsl.l < 0.5 ? "dark" : "light");
  }, [palette, colorBackground]);

  useEffect(() => {
    switch (mode) {
      case APPLICATION_MODE.WAVE_FORM:
      case APPLICATION_MODE.NOISE:
      case APPLICATION_MODE.AUDIO_SCOPE:
        setPaletteTrackEnergy(false);
        break;
      case APPLICATION_MODE.AUDIO:
        break;
      default:
        return mode satisfies never;
    }
  }, [mode, setPaletteTrackEnergy]);

  return (
    <VisualContext.Provider
      value={{
        config: {
          visual: visual,
          palette: palette,
          colorBackground: colorBackground,
          paletteTrackEnergy: paletteTrackEnergy,
        },
        setters: {
          resetConfig: () => setKey((key) => key + 1),
          setVisual: setVisual,
          setPalette: setPalette,
          setColorBackground: setColorBackground,
          setPaletteTrackEnergy: setPaletteTrackEnergy,
        },
      }}
    >
      <CombinedVisualsConfigContextProvider key={key}>
        {children}
      </CombinedVisualsConfigContextProvider>
    </VisualContext.Provider>
  );
};

export function useVisualContext() {
  const context = useContext(VisualContext);
  if (!context) {
    throw new Error(
      "useVisualContext must be used within a VisualContextProvider"
    );
  }
  return context.config;
}

export function useVisualContextSetters() {
  const context = useContext(VisualContext);
  if (!context) {
    throw new Error(
      "useVisualContext must be used within a VisualContextProvider"
    );
  }
  return context.setters;
}
