import {
  PresetBar,
  SliderField,
  SwitchRow,
} from "@/components/controls/common";

import { useActions, useParams, usePresets } from "./reactive";

export default () => {
  const {
    nParticles,
    pointScale,
    baseHue,
    decay,
    desaturation,
    minSaturation,
    useLines,
  } = useParams();
  const { setParams, setPreset } = useActions();
  const { active: activePreset, options: presetOptions } = usePresets();

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
            label="Draw Lines"
            checked={useLines}
            onCheckedChange={(v) => setParams({ useLines: v })}
          />
          <SliderField
            label={useLines ? "Sample Count" : "Particle Count"}
            value={nParticles}
            min={128}
            max={2048}
            step={64}
            onChange={(v) => setParams({ nParticles: v })}
          />
          <SliderField
            label={useLines ? "Line Width" : "Point Size"}
            value={pointScale}
            displayValue={pointScale.toFixed(1)}
            min={0.2}
            max={3.0}
            step={0.1}
            onChange={(v) => setParams({ pointScale: v })}
          />
          <SliderField
            label="Base Hue"
            value={baseHue}
            displayValue={baseHue.toFixed(2)}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setParams({ baseHue: v })}
          />
          <SliderField
            label="Noise Desaturation"
            value={desaturation}
            displayValue={desaturation.toFixed(1)}
            min={0}
            max={3}
            step={0.1}
            onChange={(v) => setParams({ desaturation: v })}
          />
          <SliderField
            label="Min Saturation"
            value={minSaturation}
            displayValue={minSaturation.toFixed(2)}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => setParams({ minSaturation: v })}
          />
          <SliderField
            label="Trail Decay"
            value={decay}
            displayValue={decay.toFixed(2)}
            min={0}
            max={0.8}
            step={0.01}
            onChange={(v) => setParams({ decay: v })}
          />
        </div>
      )}
    </div>
  );
};
