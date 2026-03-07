import {
  PresetBar,
  SliderField,
  SwitchRow,
} from "@/components/controls/common";

import { useActions, useInstance, usePresets } from "./store";

export default () => {
  const mapper = useInstance();
  const { active: activePreset, options: presetOptions } = usePresets();
  const { setPreset, setParams } = useActions();
  const params = mapper.params;

  return (
    <div className="space-y-4">
      <PresetBar
        activePreset={activePreset}
        presetOptions={presetOptions}
        onSelect={setPreset}
      />
      {!activePreset && (
        <div className="space-y-3">
          <SwitchRow
            label="Double Wave"
            checked={params.waveformFrequenciesHz.length > 1}
            onCheckedChange={(e) => {
              setParams({
                waveformFrequenciesHz: e ? [2.0, 10] : [2.0],
              });
            }}
          />
          <SliderField
            label="Max Amplitude"
            value={params.maxAmplitude}
            displayValue={params.maxAmplitude.toFixed(2)}
            min={0.0}
            max={5.0}
            step={0.01}
            onChange={(v) => setParams({ maxAmplitude: v })}
          />
          {params.waveformFrequenciesHz.map((hz, i) => (
            <SliderField
              key={`waveform_freq_${i}`}
              label={`Wave ${i + 1} Freq (Hz)`}
              value={hz}
              displayValue={hz.toFixed(2)}
              min={2.0}
              max={i === 0 ? 10.0 : 30.0}
              step={0.05}
              onChange={(v) =>
                setParams({
                  waveformFrequenciesHz: params.waveformFrequenciesHz.map(
                    (existing, j) => (i === j ? v : existing),
                  ),
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
