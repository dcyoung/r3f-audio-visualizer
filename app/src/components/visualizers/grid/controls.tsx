import { ValueLabel } from "@/components/controls/common";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { useActions, useParams, usePresets } from "./reactive";

export default () => {
  const { nGridCols, nGridRows, cubeSpacingScalar } = useParams();
  const { setParams, setPreset } = useActions();
  const { active: activePreset, options: presetOptions } = usePresets();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <Label>Grid Presets</Label>
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
          <ValueLabel label="N x Rows" value={nGridRows} />
          <Slider
            defaultValue={[nGridRows]}
            value={[nGridRows]}
            min={5}
            max={200}
            step={5}
            onValueChange={(e) => setParams({ nGridRows: e[0] })}
          />
          <ValueLabel label="N x Cols" value={nGridCols} />
          <Slider
            defaultValue={[nGridCols]}
            value={[nGridCols]}
            min={5}
            max={200}
            step={5}
            onValueChange={(e) => setParams({ nGridCols: e[0] })}
          />
          <ValueLabel
            label="Grid Spacing"
            value={cubeSpacingScalar.toFixed(2)}
          />
          <Slider
            defaultValue={[cubeSpacingScalar]}
            value={[cubeSpacingScalar]}
            min={1}
            max={6}
            step={0.5}
            onValueChange={(e) => setParams({ cubeSpacingScalar: e[0] })}
          />
        </>
      )}
    </div>
  );
};
