import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  useWaveGeneratorContext,
  useWaveGeneratorContextSetters,
} from "@/context/waveGenerator";
import { RefreshCcw } from "lucide-react";

import { ValueLabel } from "./common";

export const WaveformModeControls = () => {
  const { maxAmplitude, waveformFrequenciesHz } = useWaveGeneratorContext();
  const { setMaxAmplitude, setWaveformFrequenciesHz, reset } =
    useWaveGeneratorContextSetters();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <div className="flex w-full items-center justify-between">
        <span>Wave Form</span>
        <RefreshCcw
          className="pointer-events-auto cursor-pointer"
          onClick={() => reset()}
        />
      </div>
      <div className="flex w-full items-center justify-between">
        <Label htmlFor="color-background">Double</Label>
        <Switch
          defaultChecked={waveformFrequenciesHz.length > 1}
          onCheckedChange={(e) => {
            setWaveformFrequenciesHz(e ? [2.0, 10.0] : [2.0]);
          }}
        />
      </div>
      <ValueLabel label="Max Amplitude" value={maxAmplitude.toFixed(2)} />
      <Slider
        defaultValue={[maxAmplitude]}
        min={0.0}
        max={5.0}
        step={0.01}
        onValueChange={(e) => setMaxAmplitude(e[0])}
      />
      {[...waveformFrequenciesHz].map((hz, i) => (
        <div key={`label_waveform_frequency_${i}`} className="w-full space-y-4">
          <ValueLabel
            label={`Wave #${i + 1} - Freq (hz)`}
            value={hz.toFixed(2)}
          />
          <Slider
            key={`slider_waveform_frequency_${i}`}
            defaultValue={[hz]}
            value={[hz]}
            min={2.0}
            max={i == 0 ? 10.0 : 30.0}
            step={0.05}
            onValueChange={(e) =>
              setWaveformFrequenciesHz(
                (prev) =>
                  prev.map((v, j) => (i == j ? e[0] : v)) as [
                    number,
                    ...number[],
                  ],
              )
            }
          />
        </div>
      ))}
    </div>
  );
};
