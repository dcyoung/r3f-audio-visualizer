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
    nPerSide: 10,
    cubeSpacingScalar: 0.1,
    volume: true,
  },
  {
    name: "custom",
  },
] as const;

export default () => {
  const { nPerSide, cubeSpacingScalar, volume } = useVisualParams();
  const { setVisualParams } = useActions();
  const [preset, setPreset] = useState<(typeof Presets)[number]>(
    Presets.find(
      (p) =>
        p.name !== "custom" &&
        p.nPerSide === nPerSide &&
        p.volume === volume &&
        p.cubeSpacingScalar === cubeSpacingScalar,
    ) ?? Presets[0],
  );

  useEffect(() => {
    if (preset.name === "custom") {
      return;
    }
    const { name, ...presetParams } = preset;
    setVisualParams(presetParams);
  }, [preset, setVisualParams]);

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <Label>Cube Presets</Label>
      <div className="flex w-full items-center justify-start gap-2">
        {Presets.map((p) => (
          <Button
            key={`cube_preset_${p.name}`}
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
          <ValueLabel label="N x Per Side" value={nPerSide} />
          <Slider
            defaultValue={[nPerSide]}
            value={[nPerSide]}
            min={3}
            max={20}
            step={1}
            onValueChange={(e) => setVisualParams({ nPerSide: e[0] })}
          />
          <ValueLabel
            label="Cube Spacing"
            value={cubeSpacingScalar.toFixed(2)}
          />
          <Slider
            defaultValue={[cubeSpacingScalar]}
            value={[cubeSpacingScalar]}
            min={0}
            max={0.5}
            step={0.1}
            onValueChange={(e) => setVisualParams({ cubeSpacingScalar: e[0] })}
          />
          <div className="flex w-full items-center justify-between">
            <Label>Volume</Label>
            <Switch
              defaultChecked={volume}
              onCheckedChange={(e) => {
                setVisualParams({ volume: e });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
