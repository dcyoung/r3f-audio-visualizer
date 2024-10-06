import { useEffect, useState } from "react";
import { ValueLabel } from "@/components/controls/common";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import {
  useGridVisualConfigContext,
  useGridVisualConfigContextSetters,
} from "./config";

const Presets = [
  {
    name: "default",
    nRows: 100,
    nCols: 100,
    unitSpacingScalar: 5,
  },
  {
    name: "bands",
    nRows: 5,
    nCols: 200,
    unitSpacingScalar: 1,
  },
  {
    name: "custom",
  },
] as const;

export const GridVisualSettingsControls = () => {
  const { nCols, nRows, unitSpacingScalar } = useGridVisualConfigContext();
  const { setNCols, setNRows, setUnitSpacingScalar } =
    useGridVisualConfigContextSetters();
  const [preset, setPreset] = useState<(typeof Presets)[number]>(
    Presets.find(
      (p) =>
        p.name !== "custom" &&
        p.nRows === nRows &&
        p.nCols === nCols &&
        p.unitSpacingScalar === unitSpacingScalar,
    ) ?? Presets[0],
  );
  useEffect(() => {
    if (preset.name === "custom") {
      return;
    }
    setNRows(preset.nRows);
    setNCols(preset.nCols);
    setUnitSpacingScalar(preset.unitSpacingScalar);
  }, [preset, setNCols, setNRows, setUnitSpacingScalar]);

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
          <ValueLabel label="N x Rows" value={nRows} />
          <Slider
            defaultValue={[nRows]}
            value={[nRows]}
            min={5}
            max={200}
            step={5}
            onValueChange={(e) => setNRows(e[0])}
          />
          <ValueLabel label="N x Cols" value={nCols} />
          <Slider
            defaultValue={[nCols]}
            value={[nCols]}
            min={5}
            max={200}
            step={5}
            onValueChange={(e) => setNCols(e[0])}
          />
          <ValueLabel
            label="Grid Spacing"
            value={unitSpacingScalar.toFixed(2)}
          />
          <Slider
            defaultValue={[unitSpacingScalar]}
            value={[unitSpacingScalar]}
            min={1}
            max={6}
            step={0.5}
            onValueChange={(e) => setUnitSpacingScalar(e[0])}
          />
        </>
      )}
    </div>
  );
};
