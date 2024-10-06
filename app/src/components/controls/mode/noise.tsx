import { Slider } from "@/components/ui/slider";
import {
  useNoiseGeneratorContext,
  useNoiseGeneratorContextSetters,
} from "@/context/noiseGenerator";
import { RefreshCcw } from "lucide-react";

import { ValueLabel } from "../common";

export const NoiseGeneratorModeControls = () => {
  const { amplitude, spatialScale, timeScale, nIterations } =
    useNoiseGeneratorContext();
  const { setAmplitude, setSpatialScale, setTimeScale, setNIterations, reset } =
    useNoiseGeneratorContextSetters();
  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <div className="flex w-full items-center justify-between">
        <span>Noise</span>
        <RefreshCcw
          className="pointer-events-auto cursor-pointer"
          onClick={() => reset()}
        />
      </div>
      <ValueLabel label="Amplitude" value={amplitude.toFixed(2)} />
      <Slider
        defaultValue={[amplitude]}
        value={[amplitude]}
        min={0.0}
        max={5.0}
        step={0.01}
        onValueChange={(e) => setAmplitude(e[0])}
      />
      <ValueLabel label="Spatial Scale" value={spatialScale.toFixed(2)} />
      <Slider
        defaultValue={[spatialScale]}
        value={[spatialScale]}
        min={0.1}
        max={5.0}
        step={0.1}
        onValueChange={(e) => setSpatialScale(e[0])}
      />
      <ValueLabel label="Time Scale" value={timeScale.toFixed(2)} />
      <Slider
        defaultValue={[timeScale]}
        value={[timeScale]}
        min={0.01}
        max={2.0}
        step={0.01}
        onValueChange={(e) => setTimeScale(e[0])}
      />
      <ValueLabel label="Iteration Count" value={nIterations} />
      <Slider
        defaultValue={[nIterations]}
        value={[nIterations]}
        min={1}
        max={16}
        step={1}
        onValueChange={(e) => setNIterations(e[0])}
      />
    </div>
  );
};
