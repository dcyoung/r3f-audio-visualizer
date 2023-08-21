import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

import { AVAILABLE_VISUALS } from "@/components/canvas/Visual3D";
import {
  type AVAILABLE_COLOR_PALETTES,
  COLOR_PALETTE,
} from "@/components/visualizers/palettes";

type Visual = (typeof AVAILABLE_VISUALS)[number];
type Palette = (typeof AVAILABLE_COLOR_PALETTES)[number];
export interface VisualConfig {
  visual: Visual;
  palette: Palette;
  colorBackground: boolean;
}

export const VisualContext = createContext<{
  config: VisualConfig;
  setters: {
    setVisual: Dispatch<SetStateAction<Visual>>;
    setPalette: Dispatch<SetStateAction<Palette>>;
    setColorBackground: Dispatch<SetStateAction<boolean>>;
  };
} | null>(null);

export const VisualContextProvider = ({ children }: PropsWithChildren) => {
  const [visual, setVisual] = useState<Visual>(AVAILABLE_VISUALS[0]);
  const [palette, setPalette] = useState<Palette>(
    COLOR_PALETTE.THREE_COOL_TO_WARM
  );
  const [colorBackground, setColorBackground] = useState<boolean>(false);

  return (
    <VisualContext.Provider
      value={{
        config: {
          visual: visual,
          palette: palette,
          colorBackground: colorBackground,
        },
        setters: {
          setVisual: setVisual,
          setPalette: setPalette,
          setColorBackground: setColorBackground,
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
