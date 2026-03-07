import {
  PresetBar,
  SliderField,
  SwitchRow,
} from "@/components/controls/common";

import { useActions, useParams, usePresets } from "./reactive";

export default () => {
  const { radius, pointSize, mirrorEffects } = useParams();
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
            label="Radius"
            value={radius}
            displayValue={radius.toFixed(2)}
            min={0.25}
            max={3}
            step={0.25}
            onChange={(v) => setParams({ radius: v })}
          />
          <SliderField
            label="Point Size"
            value={pointSize}
            displayValue={pointSize.toFixed(2)}
            min={0.01}
            max={0.25}
            step={0.01}
            onChange={(v) => setParams({ pointSize: v })}
          />
          <SwitchRow
            label="Mirror Effects"
            checked={mirrorEffects}
            onCheckedChange={(v) => setParams({ mirrorEffects: v })}
          />
        </div>
      )}
    </div>
  );
};
