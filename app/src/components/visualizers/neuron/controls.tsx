import { PresetBar, SliderField } from "@/components/controls/common";
import { MathUtils } from "three";

import { NEURON_PARTICLE_COUNT_TIERS } from "./depolarizationShared";
import { useActions, useParams, usePresets } from "./reactive";

const formatParticleTier = (n: number) =>
  n >= 1_000_000 ? "1M" : `${n / 1000}k`;

export default function NeuronControls() {
  const params = useParams();
  const { setParams, setPreset } = useActions();
  const { active: activePreset, options: presetOptions } = usePresets();

  const maxTier = NEURON_PARTICLE_COUNT_TIERS.length - 1;
  const tierIdx = MathUtils.clamp(
    Math.round(params.particleCountTierIndex),
    0,
    maxTier,
  );

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
            label="Particle count"
            value={tierIdx}
            displayValue={formatParticleTier(NEURON_PARTICLE_COUNT_TIERS[tierIdx])}
            min={0}
            max={maxTier}
            step={1}
            onChange={(v) =>
              setParams({
                particleCountTierIndex: Math.round(MathUtils.clamp(v, 0, maxTier)),
              })
            }
          />
          <SliderField
            label="Per-particle intensity"
            value={params.particleIntensityScale}
            displayValue={`${(params.particleIntensityScale * 100).toFixed(0)}%`}
            min={0.05}
            max={1}
            step={0.05}
            onChange={(v) => setParams({ particleIntensityScale: v })}
          />
          <SliderField
            label="Propagation speed"
            value={params.propagationSpeed}
            displayValue={`${Math.round(params.propagationSpeed)}%`}
            min={0}
            max={100}
            step={2}
            onChange={(v) => setParams({ propagationSpeed: v })}
          />
          <SliderField
            label="Pulse vs cycle"
            value={params.waveCycleFraction}
            displayValue={`${(params.waveCycleFraction * 100).toFixed(0)}%`}
            min={0.08}
            max={0.42}
            step={0.01}
            onChange={(v) => setParams({ waveCycleFraction: v })}
          />
          <SliderField
            label="Seconds between spikes"
            value={params.spikeSpacingSec}
            displayValue={`${params.spikeSpacingSec.toFixed(1)}s`}
            min={1.5}
            max={8}
            step={0.1}
            onChange={(v) => setParams({ spikeSpacingSec: v })}
          />
          <SliderField
            label="Efflux separation"
            value={params.effluxSeparation}
            displayValue={`${Math.round(params.effluxSeparation)}%`}
            min={18}
            max={92}
            step={2}
            onChange={(v) => setParams({ effluxSeparation: v })}
          />
        </div>
      )}
    </div>
  );
}
