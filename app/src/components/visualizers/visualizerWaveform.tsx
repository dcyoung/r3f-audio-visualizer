import { Suspense, lazy, useMemo } from "react";

import { useWaveGeneratorContext } from "@/context/waveGenerator";
import { CoordinateMapper_WaveformSuperposition } from "@/lib/mappers/coordinateMappers/waveform";

const WaveformVisual = ({ visual }: { visual: string }) => {
  const VisualComponent = useMemo(
    () =>
      lazy(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        async () => await import(`./${visual}/reactive.tsx`)
      ),
    [visual]
  );

  const { maxAmplitude, waveformFrequenciesHz, amplitudeSplitRatio } =
    useWaveGeneratorContext();
  // const [{ double, amplitude, frequencyHz_1, frequencyHz_2 }, set] =
  //   useControls(
  //     "Wave Generator",
  //     () => ({
  //       double: visual == "diffusedRing",
  //       amplitude: {
  //         value: 1.0,
  //         min: 0.0,
  //         max: 5.0,
  //         step: 0.01,
  //       },
  //       frequencyHz_1: {
  //         value: 2.0,
  //         min: 0.0,
  //         max: 30,
  //         step: 0.05,
  //       },
  //       frequencyHz_2: {
  //         value: 10.0,
  //         min: 0.0,
  //         max: 30,
  //         step: 0.05,
  //         // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //         render: (get) => get("Wave Generator.double"),
  //       },
  //     }),
  //     { collapsed: true }
  //   );

  const coordinateMapper = new CoordinateMapper_WaveformSuperposition(
    waveformFrequenciesHz,
    maxAmplitude,
    amplitudeSplitRatio
  );

  // // Reset the default values whenever the visual changes
  // useEffect(() => {
  //   if (visual == "diffusedRing") {
  //     set({
  //       double: true,
  //       amplitude: 1.0,
  //       frequencyHz_1: 2.0,
  //       frequencyHz_2: 10.0,
  //     });
  //   } else {
  //     set({
  //       double: false,
  //       amplitude: 1.0,
  //       frequencyHz_1: 2.0,
  //       frequencyHz_2: 10.0,
  //     });
  //   }
  // }, [visual]);

  return (
    <Suspense fallback={null}>
      <VisualComponent coordinateMapper={coordinateMapper} />
    </Suspense>
  );
};

export default WaveformVisual;
