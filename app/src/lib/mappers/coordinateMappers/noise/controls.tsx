import { ValueLabel } from "@/components/controls/common";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { useActions, useInstance, usePresets } from "./store";

export default () => {
  const mapper = useInstance();
  const { active: activePreset, options: presetOptions } = usePresets();
  const { setPreset, setParams } = useActions();
  const params = mapper.params;

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <Label>Noise</Label>
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
          <ValueLabel label="Amplitude" value={params.amplitude.toFixed(2)} />
          <Slider
            defaultValue={[params.amplitude]}
            value={[params.amplitude]}
            min={0.0}
            max={5.0}
            step={0.01}
            onValueChange={(e) => setParams({ amplitude: e[0] })}
          />
          <ValueLabel
            label="Spatial Scale"
            value={params.spatialScale.toFixed(2)}
          />
          <Slider
            defaultValue={[params.spatialScale]}
            value={[params.spatialScale]}
            min={0.1}
            max={5.0}
            step={0.1}
            onValueChange={(e) => setParams({ spatialScale: e[0] })}
          />
          <ValueLabel label="Time Scale" value={params.timeScale.toFixed(2)} />
          <Slider
            defaultValue={[params.timeScale]}
            value={[params.timeScale]}
            min={0.01}
            max={2.0}
            step={0.01}
            onValueChange={(e) => ({ timeScale: e[0] })}
          />
          <ValueLabel label="Iteration Count" value={params.nIterations} />
          <Slider
            defaultValue={[params.nIterations]}
            value={[params.nIterations]}
            min={1}
            max={16}
            step={1}
            onValueChange={(e) => ({ nIterations: e[0] })}
          />
        </>
      )}
    </div>
  );
};
