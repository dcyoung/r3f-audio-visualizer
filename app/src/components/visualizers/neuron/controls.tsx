import { PresetBar, SliderField, SwitchRow } from "@/components/controls/common";

import { useActions, useParams, usePresets } from "./reactive";

export default function NeuronControls() {
  const params = useParams();
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
            label="GPU depolarization"
            checked={params.depolarizationUseGpu}
            onCheckedChange={(v) => setParams({ depolarizationUseGpu: v })}
          />
          <SliderField
            label="Propagation speed"
            value={params.propagationSpeed}
            displayValue={`${Math.round(params.propagationSpeed)}%`}
            min={0}
            max={100}
            step={2}
            onChange={(v) => setParams({ propagationSpeed: v })}
          />
          <SliderField
            label="Pulse vs cycle"
            value={params.waveCycleFraction}
            displayValue={`${(params.waveCycleFraction * 100).toFixed(0)}%`}
            min={0.08}
            max={0.42}
            step={0.01}
            onChange={(v) => setParams({ waveCycleFraction: v })}
          />
          <SliderField
            label="Seconds between spikes"
            value={params.spikeSpacingSec}
            displayValue={`${params.spikeSpacingSec.toFixed(1)}s`}
            min={1.5}
            max={8}
            step={0.1}
            onChange={(v) => setParams({ spikeSpacingSec: v })}
          />
          <SliderField
            label="Efflux separation"
            value={params.effluxSeparation}
            displayValue={`${Math.round(params.effluxSeparation)}%`}
            min={18}
            max={92}
            step={2}
            onChange={(v) => setParams({ effluxSeparation: v })}
          />
        </div>
      )}
    </div>
  );
}
