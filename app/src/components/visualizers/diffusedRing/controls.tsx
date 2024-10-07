import { useEffect, useState } from "react";
import { ValueLabel } from "@/components/controls/common";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import { useActions, useVisualParams } from "./reactive";

const Presets = [
  {
    name: "default",
    radius: 2,
    pointSize: 0.2,
    mirrorEffects: false,
  },
  {
    name: "custom",
  },
] as const;

export default () => {
  const { radius, pointSize, mirrorEffects } = useVisualParams();
  const { setVisualParams } = useActions();

  const [preset, setPreset] = useState<(typeof Presets)[number]>(
    Presets.find(
      (p) =>
        p.name !== "custom" &&
        p.pointSize === pointSize &&
        p.radius === radius &&
        p.mirrorEffects === mirrorEffects,
    ) ?? Presets[0],
  );

  useEffect(() => {
    if (preset.name === "custom") {
      return;
    }
    setVisualParams(preset);
  }, [preset, setVisualParams]);

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <Label>Diffused Ring Presets</Label>
      <div className="flex w-full items-center justify-start gap-2">
        {Presets.map((p) => (
          <Button
            key={`sphere_preset_${p.name}`}
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
          <ValueLabel label="Radius" value={radius.toFixed(2)} />
          <Slider
            defaultValue={[radius]}
            value={[radius]}
            min={0.25}
            max={3}
            step={0.25}
            onValueChange={(e) => setVisualParams({ radius: e[0] })}
          />
          <ValueLabel label="Point Size" value={pointSize.toFixed(2)} />
          <Slider
            defaultValue={[pointSize]}
            value={[pointSize]}
            min={0.01}
            max={0.25}
            step={0.01}
            onValueChange={(e) => setVisualParams({ pointSize: e[0] })}
          />
          <div className="flex w-full items-center justify-between">
            <Label>Mirror Effects</Label>
            <Switch
              defaultChecked={mirrorEffects}
              onCheckedChange={(e) => {
                setVisualParams({ mirrorEffects: e });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
