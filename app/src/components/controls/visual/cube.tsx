import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  useCubeVisualConfigContext,
  useCubeVisualConfigContextSetters,
} from "@/context/visualConfig/cube";

import { ValueLabel } from "../mode/common";

const Presets = [
  {
    name: "default",
    nPerSide: 10,
    unitSpacingScalar: 0.1,
    volume: true,
  },
  {
    name: "custom",
  },
] as const;

export const CubeVisualSettingsControls = () => {
  const { nPerSide, unitSpacingScalar, volume } = useCubeVisualConfigContext();
  const { setNPerSide, setUnitSpacingScalar, setVolume } =
    useCubeVisualConfigContextSetters();
  const [preset, setPreset] = useState<(typeof Presets)[number]>(
    Presets.find(
      (p) =>
        p.name !== "custom" &&
        p.nPerSide === nPerSide &&
        p.volume === volume &&
        p.unitSpacingScalar === unitSpacingScalar,
    ) ?? Presets[0],
  );

  useEffect(() => {
    if (preset.name === "custom") {
      return;
    }
    setNPerSide(preset.nPerSide);
    setUnitSpacingScalar(preset.unitSpacingScalar);
    setVolume(preset.volume);
  }, [preset, setNPerSide, setUnitSpacingScalar, setVolume]);

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
            onValueChange={(e) => setNPerSide(e[0])}
          />
          <ValueLabel
            label="Cube Spacing"
            value={unitSpacingScalar.toFixed(2)}
          />
          <Slider
            defaultValue={[unitSpacingScalar]}
            value={[unitSpacingScalar]}
            min={0}
            max={0.5}
            step={0.1}
            onValueChange={(e) => setUnitSpacingScalar(e[0])}
          />
          <div className="flex w-full items-center justify-between">
            <Label>Volume</Label>
            <Switch
              defaultChecked={volume}
              onCheckedChange={(e) => {
                setVolume(e);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
