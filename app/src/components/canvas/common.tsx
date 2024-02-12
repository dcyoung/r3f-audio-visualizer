import { useVisualContext } from "@/context/visual";
import { usePalette } from "@/lib/appState";
import { ColorPalette } from "@/lib/palettes";

const useBackgroundColor = () => {
  const { colorBackground } = useVisualContext();
  const palette = usePalette();
  return colorBackground
    ? ColorPalette.getPalette(palette).calcBackgroundColor(0)
    : "#010204";
};

export const CanvasBackground = () => {
  const backgroundColor = useBackgroundColor();
  return <color attach="background" args={[backgroundColor]} />;
};

export const BackgroundFog = () => {
  const backgroundColor = useBackgroundColor();
  return <fog attach="fog" args={[backgroundColor, 0, 100]} />;
};
