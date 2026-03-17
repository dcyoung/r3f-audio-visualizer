import {
  PresetBar,
  SliderField,
  SwitchRow,
} from "@/components/controls/common";

import { useActions, useParams, usePresets } from "./reactive";

export default () => {
  const {
    particleCount,
    stiffness,
    dynamicViscosity,
    wallAmplitude,
    showWireframe,
  } = useParams();
  const { setParams, setPreset } = useActions();
  const { active: activePreset, options: presetOptions } = usePresets();

  return (
    <div className="space-y-4">
      <PresetBar
        activePreset={activePreset}
        presetOptions={presetOptions}
        onSelect={setPreset}
      />
      {!activePreset && (
        <div className="space-y-3">
          <SliderField
            label="Particles"
            value={particleCount}
            displayValue={`${(particleCount / 1024).toFixed(0)}k`}
            min={4096}
            max={8192 * 16}
            step={4096}
            onChange={(v) => setParams({ particleCount: v })}
          />
          <SliderField
            label="Wall Amplitude"
            value={wallAmplitude}
            displayValue={wallAmplitude.toFixed(2)}
            min={0.01}
            max={0.3}
            step={0.01}
            onChange={(v) => setParams({ wallAmplitude: v })}
          />
          <SliderField
            label="Stiffness"
            value={stiffness}
            displayValue={stiffness.toFixed(0)}
            min={10}
            max={200}
            step={5}
            onChange={(v) => setParams({ stiffness: v })}
          />
          <SliderField
            label="Viscosity"
            value={dynamicViscosity}
            displayValue={dynamicViscosity.toFixed(2)}
            min={0.01}
            max={0.5}
            step={0.01}
            onChange={(v) => setParams({ dynamicViscosity: v })}
          />
          <SwitchRow
            label="Show Wireframe"
            checked={showWireframe}
            onCheckedChange={(v) => setParams({ showWireframe: v })}
          />
        </div>
      )}
    </div>
  );
};
