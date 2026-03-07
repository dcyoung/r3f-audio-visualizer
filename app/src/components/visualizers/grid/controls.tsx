import { PresetBar, SliderField } from "@/components/controls/common";

import { useActions, useParams, usePresets } from "./reactive";

export default () => {
  const { nGridCols, nGridRows, cubeSpacingScalar } = useParams();
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
            label="Rows"
            value={nGridRows}
            min={5}
            max={200}
            step={5}
            onChange={(v) => setParams({ nGridRows: v })}
          />
          <SliderField
            label="Columns"
            value={nGridCols}
            min={5}
            max={200}
            step={5}
            onChange={(v) => setParams({ nGridCols: v })}
          />
          <SliderField
            label="Grid Spacing"
            value={cubeSpacingScalar}
            displayValue={cubeSpacingScalar.toFixed(2)}
            min={1}
            max={6}
            step={0.5}
            onChange={(v) => setParams({ cubeSpacingScalar: v })}
          />
        </div>
      )}
    </div>
  );
};
