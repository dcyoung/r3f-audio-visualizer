import { useEffect, useState } from "react";
import { ValueLabel } from "@/components/controls/common";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { useActions, useVisualParams } from "./reactive";

const Presets = [
  {
    name: "default",
    nGridCols: 100,
    nGridRows: 100,
    cubeSpacingScalar: 5,
  },
  {
    name: "bands",
    nGridRows: 5,
    nGridCols: 200,
    cubeSpacingScalar: 1,
  },
  {
    name: "custom",
  },
] as const;

export default () => {
  const { nGridCols, nGridRows, cubeSpacingScalar } = useVisualParams();
  const { setVisualParams } = useActions();
  // TODO: Genericize
  const [preset, setPreset] = useState<(typeof Presets)[number]>(
    Presets.find(
      (p) =>
        p.name !== "custom" &&
        p.nGridRows === nGridRows &&
        p.nGridCols === nGridCols &&
        p.cubeSpacingScalar === cubeSpacingScalar,
    ) ?? Presets[0],
  );
  useEffect(() => {
    if (preset.name === "custom") {
      return;
    }
    const { name: _, ...presetParams } = preset;
    setVisualParams(presetParams);
  }, [preset, setVisualParams]);

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <Label>Grid Presets</Label>
      <div className="flex w-full items-center justify-start gap-2">
        {Presets.map((p) => (
          <Button
            key={`grid_preset_${p.name}`}
            variant="ghost"
            aria-selected={p === preset}
            className="p-2 aria-selected:bg-primary/20"
            onClick={() => setPreset(p)}
          >
            {p.name}
          </Button>
        ))}
      </div>
      {preset.name === "custom" && (
        <>
          <ValueLabel label="N x Rows" value={nGridRows} />
          <Slider
            defaultValue={[nGridRows]}
            value={[nGridRows]}
            min={5}
            max={200}
            step={5}
            onValueChange={(e) => setVisualParams({ nGridRows: e[0] })}
          />
          <ValueLabel label="N x Cols" value={nGridCols} />
          <Slider
            defaultValue={[nGridCols]}
            value={[nGridCols]}
            min={5}
            max={200}
            step={5}
            onValueChange={(e) => setVisualParams({ nGridCols: e[0] })}
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
            onValueChange={(e) => setVisualParams({ cubeSpacingScalar: e[0] })}
          />
        </>
      )}
    </div>
  );
};
