import { usePalette } from "@/lib/appState";
import { ColorPalette } from "@/lib/palettes";

import { type TVisualProps } from "../models";
import BaseScopeVisual from "./base";

export default ({ textureMapper }: TVisualProps) => {
  const palette = usePalette();
  const color = ColorPalette.getPalette(palette).lerpColor(0.5);
  return (
    <BaseScopeVisual
      textureMapper={textureMapper}
      usePoints={true}
      interpolate={false}
      color={color}
    />
  );
};
