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
    speakerAmplitude,
    cylinderRadius,
    cylinderHeight,
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
            label="Speaker Amplitude"
            value={speakerAmplitude}
            displayValue={speakerAmplitude.toFixed(3)}
            min={0.005}
            max={0.15}
            step={0.005}
            onChange={(v) => setParams({ speakerAmplitude: v })}
          />
          <SliderField
            label="Cylinder Radius"
            value={cylinderRadius}
            displayValue={cylinderRadius.toFixed(2)}
            min={0.15}
            max={0.45}
            step={0.01}
            onChange={(v) => setParams({ cylinderRadius: v })}
          />
          <SliderField
            label="Cylinder Height"
            value={cylinderHeight}
            displayValue={cylinderHeight.toFixed(2)}
            min={0.2}
            max={0.8}
            step={0.05}
            onChange={(v) => setParams({ cylinderHeight: v })}
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
