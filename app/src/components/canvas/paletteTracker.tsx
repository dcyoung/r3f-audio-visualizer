import { useVisualContext, useVisualContextSetters } from "@/context/visual";
import { ScalarMovingAvgEventDetector } from "@/lib/analyzers/eventDetector";
import { useEnergyInfo } from "@/lib/appState";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";
import { EnergyTracker } from "@/lib/mappers/valueTracker/energyTracker";
import { AVAILABLE_COLOR_PALETTES } from "@/lib/palettes";
import { useFrame } from "@react-three/fiber";

const PaletteUpdater = ({
  scalarTracker,
}: {
  scalarTracker: IScalarTracker;
}) => {
  const detector = new ScalarMovingAvgEventDetector(0.5, 150, 500);
  const { setPalette } = useVisualContextSetters();

  useFrame(() => {
    detector.observe(scalarTracker.getNormalizedValue());
    if (detector.triggered()) {
      setPalette((prev) => {
        const currIdx = AVAILABLE_COLOR_PALETTES.indexOf(prev) ?? 0;
        const nextIdx = (currIdx + 1) % AVAILABLE_COLOR_PALETTES.length;
        return AVAILABLE_COLOR_PALETTES[nextIdx];
      });
      detector.reset();
    }
  });

  return <></>;
};

const PaletteTracker = () => {
  const energyInfo = useEnergyInfo();
  const scalarTracker = new EnergyTracker(energyInfo);

  return <PaletteUpdater scalarTracker={scalarTracker} />;
};

export const MaybePaletteTracker = () => {
  const { paletteTrackEnergy } = useVisualContext();
  if (!paletteTrackEnergy) {
    return null;
  }
  return <PaletteTracker />;
};
