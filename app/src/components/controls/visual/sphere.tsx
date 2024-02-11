import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  useSphereVisualConfigContext,
  useSphereVisualConfigContextSetters,
} from "@/context/visualConfig/sphere";

import { ValueLabel } from "../mode/common";

const Presets = [
  {
    name: "default",
    radius: 2,
    nPoints: 800,
  },
  {
    name: "custom",
  },
] as const;

export const SphereVisualSettingsControls = () => {
  const { radius, nPoints } = useSphereVisualConfigContext();
  const { setRadius, setNPoints } = useSphereVisualConfigContextSetters();
  const [preset, setPreset] = useState<(typeof Presets)[number]>(
    Presets.find(
      (p) =>
        p.name !== "custom" && p.nPoints === nPoints && p.radius === radius,
    ) ?? Presets[0],
  );

  useEffect(() => {
    if (preset.name === "custom") {
      return;
    }
    setRadius(preset.radius);
    setNPoints(preset.nPoints);
  }, [preset, setRadius, setNPoints]);

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <Label>Sphere Presets</Label>
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
          <ValueLabel label="Point Count" value={nPoints} />
          <Slider
            defaultValue={[nPoints]}
            value={[nPoints]}
            min={100}
            max={2000}
            step={25}
            onValueChange={(e) => setNPoints(e[0])}
          />

          <ValueLabel label="Radius" value={radius.toFixed(2)} />
          <Slider
            defaultValue={[radius]}
            value={[radius]}
            min={0.25}
            max={3}
            step={0.25}
            onValueChange={(e) => setRadius(e[0])}
          />
        </>
      )}
    </div>
  );
};
