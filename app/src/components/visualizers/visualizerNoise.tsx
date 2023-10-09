import { Suspense, lazy, useMemo } from "react";

import { useNoiseGeneratorContext } from "@/context/noiseGenerator";
import { CoordinateMapper_Noise } from "@/lib/mappers/coordinateMappers/noise";

const NoiseVisual = ({ visual }: { visual: string }) => {
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
  // const { amplitude, spatialScale, timeScale, nIterations } = useControls({
  //   "Noise Generator": folder({
  //     amplitude: {
  //       value: 1.0,
  //       min: 0.0,
  //       max: 5.0,
  //       step: 0.01,
  //     },
  //     spatialScale: {
  //       value: 2.0,
  //       min: 0.1,
  //       max: 5.0,
  //       step: 0.1,
  //     },
  //     timeScale: {
  //       value: 0.5,
  //       min: 0.01,
  //       max: 2.0,
  //       step: 0.01,
  //     },
  //     nIterations: {
  //       value: 10,
  //       min: 1,
  //       max: 16,
  //       step: 1,
  //     },
  //   }),
  // });

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
