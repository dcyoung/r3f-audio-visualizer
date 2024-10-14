import { ValueLabel } from "@/components/controls/common";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import { useActions, useInstance, usePresets } from "./store";

export default () => {
  const mapper = useInstance();
  const { active: activePreset, options: presetOptions } = usePresets();
  const { setPreset, setParams } = useActions();
  const params = mapper.params;

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <Label>Wave Form</Label>
      <div className="flex w-full items-center justify-start gap-2">
        {[...Object.keys(presetOptions), "custom"].map((p) => (
          <Button
            key={`po_${p}`}
            variant="ghost"
            aria-selected={activePreset === p}
            className="p-2 aria-selected:bg-primary/20"
            onClick={() => setPreset(p === "custom" ? undefined : p)}
          >
            {p}
          </Button>
        ))}
      </div>
      {!activePreset && (
        <>
          <div className="flex w-full items-center justify-between">
            <Label>Double</Label>
            <Switch
              checked={params.waveformFrequenciesHz.length > 1}
              defaultChecked={params.waveformFrequenciesHz.length > 1}
              onCheckedChange={(e) => {
                setParams({
                  waveformFrequenciesHz: e ? [2.0, 10] : [2.0],
                });
              }}
            />
          </div>
          <ValueLabel
            label="Max Amplitude"
            value={params.maxAmplitude.toFixed(2)}
          />
          <Slider
            defaultValue={[params.maxAmplitude]}
            value={[params.maxAmplitude]}
            min={0.0}
            max={5.0}
            step={0.01}
            onValueChange={(e) => setParams({ maxAmplitude: e[0] })}
          />
          {params.waveformFrequenciesHz.map((hz, i) => (
            <div
              key={`label_waveform_frequency_${i}`}
              className="w-full space-y-4"
            >
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
                  setParams({
                    waveformFrequenciesHz: params.waveformFrequenciesHz.map(
                      (v, j) => (i == j ? e[0] : v),
                    ),
                  })
                }
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};
