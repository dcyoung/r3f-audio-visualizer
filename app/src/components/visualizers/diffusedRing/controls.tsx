import { ValueLabel } from "@/components/controls/common";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import { useActions, useParams, usePresets } from "./reactive";

export default () => {
  const { radius, pointSize, mirrorEffects } = useParams();
  const { setParams, setPreset } = useActions();
  const { active: activePreset, options: presetOptions } = usePresets();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <Label>Diffused Ring Presets</Label>
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
          <ValueLabel label="Radius" value={radius.toFixed(2)} />
          <Slider
            defaultValue={[radius]}
            value={[radius]}
            min={0.25}
            max={3}
            step={0.25}
            onValueChange={(e) => setParams({ radius: e[0] })}
          />
          <ValueLabel label="Point Size" value={pointSize.toFixed(2)} />
          <Slider
            defaultValue={[pointSize]}
            value={[pointSize]}
            min={0.01}
            max={0.25}
            step={0.01}
            onValueChange={(e) => setParams({ pointSize: e[0] })}
          />
          <div className="flex w-full items-center justify-between">
            <Label>Mirror Effects</Label>
            <Switch
              defaultChecked={mirrorEffects}
              onCheckedChange={(e) => {
                setParams({ mirrorEffects: e });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
