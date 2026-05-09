import {
  PresetBar,
  SliderField,
  SwitchRow,
} from "@/components/controls/common";

import { useActions, useParams, usePresets } from "./reactive";

export default function WaveHistoryControls() {
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
          <SliderField
            label="Sample Count"
            value={params.nSamples}
            displayValue={`${params.nSamples}`}
            min={128}
            max={1024}
            step={64}
            onChange={(v) => setParams({ nSamples: Math.round(v) })}
          />
          <SliderField
            label="History Duration"
            value={params.historyDurationSec}
            displayValue={`${params.historyDurationSec.toFixed(1)}s`}
            min={0.8}
            max={5}
            step={0.1}
            onChange={(v) => setParams({ historyDurationSec: v })}
          />
          <SliderField
            label="Capture Interval"
            value={params.captureIntervalMs}
            displayValue={`${Math.round(params.captureIntervalMs)}ms`}
            min={16}
            max={80}
            step={1}
            onChange={(v) => setParams({ captureIntervalMs: Math.round(v) })}
          />
          <SwitchRow
            label="Absolute Height"
            checked={params.absoluteHeight}
            onCheckedChange={(v) => setParams({ absoluteHeight: v })}
          />
          <SliderField
            label="Amplitude Scale"
            value={params.amplitudeScale}
            displayValue={params.amplitudeScale.toFixed(2)}
            min={0.2}
            max={2.5}
            step={0.05}
            onChange={(v) => setParams({ amplitudeScale: v })}
          />
          <SliderField
            label="Line Width"
            value={params.lineWidth}
            displayValue={params.lineWidth.toFixed(1)}
            min={0.4}
            max={4}
            step={0.1}
            onChange={(v) => setParams({ lineWidth: v })}
          />
          <SliderField
            label="History Depth"
            value={params.historyDepth}
            displayValue={params.historyDepth.toFixed(1)}
            min={0}
            max={5}
            step={0.1}
            onChange={(v) => setParams({ historyDepth: v })}
          />
          <SliderField
            label="History Flatten"
            value={params.historyFlatten}
            displayValue={params.historyFlatten.toFixed(2)}
            min={0.2}
            max={1}
            step={0.02}
            onChange={(v) => setParams({ historyFlatten: v })}
          />
        </div>
      )}
    </div>
  );
}
