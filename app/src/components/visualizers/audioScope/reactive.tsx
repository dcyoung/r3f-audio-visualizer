import { useEffect } from "react";

import { useVisualContext, useVisualContextSetters } from "@/context/visual";
import { ColorPalette } from "@/lib/palettes";

import BaseScopeVisual, { type TextureMapper } from "./base";

const ScopeVisual = ({ textureMapper }: { textureMapper: TextureMapper }) => {
  const { palette } = useVisualContext();
  const { setColorBackground, setPalette } = useVisualContextSetters();
  const color = ColorPalette.getPalette(palette).lerpColor(0.5);
  const usePoints = true;

  useEffect(() => {
    setPalette("rainbow");
    setColorBackground(false);
  }, []);

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
