import {
  PresetBar,
  SliderField,
  SwitchRow,
} from "@/components/controls/common";

import { useActions, useParams, usePresets } from "./reactive";

export default () => {
  const { nPerSide, cubeSpacingScalar, volume } = useParams();
  const { active: activePreset, options: presetOptions } = usePresets();
  const { setParams, setPreset } = useActions();

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
            label="Per Side"
            value={nPerSide}
            min={3}
            max={20}
            step={1}
            onChange={(v) => setParams({ nPerSide: v })}
          />
          <SliderField
            label="Cube Spacing"
            value={cubeSpacingScalar}
            displayValue={cubeSpacingScalar.toFixed(2)}
            min={0}
            max={0.5}
            step={0.1}
            onChange={(v) => setParams({ cubeSpacingScalar: v })}
          />
          <SwitchRow
            label="Volume"
            checked={volume}
            onCheckedChange={(v) => setParams({ volume: v })}
          />
        </div>
      )}
    </div>
  );
};
