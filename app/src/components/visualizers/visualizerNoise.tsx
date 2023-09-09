import { folder, useControls } from "leva";
import { Suspense, lazy } from "react";

import { CoordinateMapper_Noise } from "@/lib/mappers/coordinateMappers/noise";
import { type ColorPaletteType, COLOR_PALETTE } from "@/lib/palettes";

const NoiseVisual = ({
  visual,
  palette = COLOR_PALETTE.THREE_COOL_TO_WARM,
}: {
  visual: string;
  palette?: ColorPaletteType;
}) => {
  const VisualComponent = lazy(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    async () => await import(`./${visual}/reactive.tsx`)
  );

  const { amplitude, spatialScale, timeScale, nIterations } = useControls({
    "Noise Generator": folder({
      amplitude: {
        value: 1.0,
        min: 0.0,
        max: 5.0,
        step: 0.01,
      },
      spatialScale: {
        value: 2.0,
        min: 0.1,
        max: 5.0,
        step: 0.1,
      },
      timeScale: {
        value: 0.5,
        min: 0.01,
        max: 2.0,
        step: 0.01,
      },
      nIterations: {
        value: 10,
        min: 1,
        max: 16,
        step: 1,
      },
    }),
  });

  const coordinateMapper = new CoordinateMapper_Noise(
    amplitude,
    spatialScale,
    timeScale,
    nIterations
  );

  return (
    <>
      <Suspense fallback={null}>
        <VisualComponent
          coordinateMapper={coordinateMapper}
          palette={palette}
        />
      </Suspense>
    </>
  );
};

export default NoiseVisual;
