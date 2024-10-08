import { useEffect } from "react";
import { useVisualContextSetters } from "@/context/visual";
import { useAppStateActions, usePalette } from "@/lib/appState";
import { ColorPalette } from "@/lib/palettes";

import { type TVisualProps } from "../models";
import BaseScopeVisual from "./base";

const ScopeVisual = ({ textureMapper }: TVisualProps) => {
  const palette = usePalette();
  const { setPalette } = useAppStateActions();
  const { setColorBackground } = useVisualContextSetters();
  const color = ColorPalette.getPalette(palette).lerpColor(0.5);
  const usePoints = true;

  useEffect(() => {
    setPalette("rainbow");
    setColorBackground(false);
  }, [setPalette, setColorBackground]);

  return (
    <BaseScopeVisual
      textureMapper={textureMapper}
      usePoints={usePoints}
      interpolate={false}
      color={color}
    />
  );
};

export default ScopeVisual;
