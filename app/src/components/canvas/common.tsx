import { useAppearance, useVisual } from "@/lib/appState";
import { ColorPalette } from "@/lib/palettes";

const FLUID_VISUAL_IDS = new Set(["fluidBox", "fluidSpeaker", "fluidBall"]);
const DARK_BACKGROUND_VISUAL_IDS = new Set(["waveHistory"]);

export const useBackgroundColor = () => {
  const { colorBackground, palette } = useAppearance();
  const visual = useVisual();

  if (FLUID_VISUAL_IDS.has(visual.id)) {
    return "#f0efe8";
  }

  if (DARK_BACKGROUND_VISUAL_IDS.has(visual.id)) {
    return "#010204";
  }

  return colorBackground
    ? ColorPalette.getPalette(palette).calcBackgroundColor(0)
    : "#010204";
};

export const BackgroundFog = () => {
  const visual = useVisual();
  const backgroundColor = useBackgroundColor();
  if (FLUID_VISUAL_IDS.has(visual.id)) return null;
  return <fog attach="fog" args={[backgroundColor, 0, 100]} />;
};
