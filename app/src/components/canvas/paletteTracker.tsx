import { useFrame } from "@react-three/fiber";
import { useState } from "react";

import { useVisualContext, useVisualContextSetters } from "@/context/visual";
import { useEnergyInfo } from "@/lib/appState";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";
import { EnergyTracker } from "@/lib/mappers/valueTracker/energyTracker";
import { AVAILABLE_COLOR_PALETTES } from "@/lib/palettes";

const PaletteUpdater = ({
  scalarTracker,
}: {
  scalarTracker: IScalarTracker;
}) => {
  const threshold = 0.5;
  const frameSpan = 10;
  const { setPalette } = useVisualContextSetters();
  const [movingAvg, setMovingAvg] = useState(0);

  useFrame(() => {
    const curr = scalarTracker.getNormalizedValue();
    if (movingAvg < threshold && curr > threshold) {
      setPalette((prev) => {
        const currIdx = AVAILABLE_COLOR_PALETTES.indexOf(prev) ?? 0;
        const nextIdx = (currIdx + 1) % AVAILABLE_COLOR_PALETTES.length;
        return AVAILABLE_COLOR_PALETTES[nextIdx];
      });
      setMovingAvg(1);
    } else {
      setMovingAvg((prev) => {
        return (prev * (frameSpan - 1) + curr) / frameSpan;
      });
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
