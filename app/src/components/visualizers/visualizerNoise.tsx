import { Suspense, lazy, useMemo } from "react";

import { type VisualType } from "@/components/visualizers/common";
import { useNoiseGeneratorContext } from "@/context/noiseGenerator";
import { CoordinateMapper_Noise } from "@/lib/mappers/coordinateMappers/noise";

const NoiseVisual = ({ visual }: { visual: VisualType }) => {
  const VisualComponent = useMemo(
    () =>
      lazy(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        async () => await import(`./${visual}/reactive.tsx`)
      ),
    [visual]
  );

  const { amplitude, spatialScale, timeScale, nIterations } =
    useNoiseGeneratorContext();

  const coordinateMapper = new CoordinateMapper_Noise(
    amplitude,
    spatialScale,
    timeScale,
    nIterations
  );

  return (
    <>
      <Suspense fallback={null}>
        <VisualComponent coordinateMapper={coordinateMapper} />
      </Suspense>
    </>
  );
};

export default NoiseVisual;
