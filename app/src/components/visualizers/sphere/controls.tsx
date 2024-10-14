import { ValueLabel } from "@/components/controls/common";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { useActions, useParams, usePresets } from "./reactive";

export default () => {
  const { radius, nPoints } = useParams();
  const { setParams, setPreset } = useActions();
  const { active: activePreset, options: presetOptions } = usePresets();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <Label>Sphere Presets</Label>
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
          <ValueLabel label="Point Count" value={nPoints} />
          <Slider
            defaultValue={[nPoints]}
            value={[nPoints]}
            min={100}
            max={2000}
            step={25}
            onValueChange={(e) => setParams({ nPoints: e[0] })}
          />

          <ValueLabel label="Radius" value={radius.toFixed(2)} />
          <Slider
            defaultValue={[radius]}
            value={[radius]}
            min={0.25}
            max={3}
            step={0.25}
            onValueChange={(e) => setParams({ radius: e[0] })}
          />
        </>
      )}
    </div>
  );
};
