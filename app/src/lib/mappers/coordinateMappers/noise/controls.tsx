import { PresetBar, SliderField } from "@/components/controls/common";

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
          <SliderField
            label="Amplitude"
            value={params.amplitude}
            displayValue={params.amplitude.toFixed(2)}
            min={0.0}
            max={5.0}
            step={0.01}
            onChange={(v) => setParams({ amplitude: v })}
          />
          <SliderField
            label="Spatial Scale"
            value={params.spatialScale}
            displayValue={params.spatialScale.toFixed(2)}
            min={0.1}
            max={5.0}
            step={0.1}
            onChange={(v) => setParams({ spatialScale: v })}
          />
          <SliderField
            label="Time Scale"
            value={params.timeScale}
            displayValue={params.timeScale.toFixed(2)}
            min={0.01}
            max={2.0}
            step={0.01}
            onChange={(v) => setParams({ timeScale: v })}
          />
          <SliderField
            label="Iterations"
            value={params.nIterations}
            min={1}
            max={16}
            step={1}
            onChange={(v) => setParams({ nIterations: v })}
          />
        </div>
      )}
    </div>
  );
};
