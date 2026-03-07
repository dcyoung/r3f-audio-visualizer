import { PresetBar, SliderField } from "@/components/controls/common";

import { useActions, useParams, usePresets } from "./reactive";

export default () => {
  const { radius, nPoints } = useParams();
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
            label="Point Count"
            value={nPoints}
            min={100}
            max={2000}
            step={25}
            onChange={(v) => setParams({ nPoints: v })}
          />
          <SliderField
            label="Radius"
            value={radius}
            displayValue={radius.toFixed(2)}
            min={0.25}
            max={3}
            step={0.25}
            onChange={(v) => setParams({ radius: v })}
          />
        </div>
      )}
    </div>
  );
};
