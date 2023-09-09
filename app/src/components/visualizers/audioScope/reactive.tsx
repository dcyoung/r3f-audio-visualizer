import { folder, useControls } from "leva";
import { useEffect } from "react";

import { useVisualContext, useVisualContextSetters } from "@/context/visual";

import BaseScopeVisual, { type TextureMapper } from "./base";
import { ColorPalette } from "../palettes";


const ScopeVisual = ({ textureMapper }: { textureMapper: TextureMapper }) => {
  const { palette } = useVisualContext();
  const { setColorBackground, setPalette } = useVisualContextSetters();
  const color = ColorPalette.getPalette(palette).lerpColor(0.5);
  const { usePoints } = useControls({
    "Visual - Scope": folder(
      {
        usePoints: true,
      },
      { collapsed: true }
    ),
  });

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
