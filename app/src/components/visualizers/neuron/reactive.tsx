import { useMemo } from "react";
import { MathUtils } from "three";
import { createConfigStore } from "@/lib/storeHelpers";
import { type TVisualProps } from "@/components/visualizers/models";

import { buildNeuronSegments, NeuronModel } from "./base";
import { DEFAULT_APPROX_AP_PARAMS } from "./canonicalActionPotential";
import {
  DEFAULT_DEPOLARIZATION_BAND_WIDTH,
  DepolarizationParticlesGpu,
} from "./depolarization";
import { DepolarizationParticlesCpu } from "./depolarizationCpu";
import {
  DEFAULT_PHASE_MS_PER_WALL_MS,
  useNeuronWaveformSampler,
} from "./useNeuronWaveformSampler";

export type NeuronVisualConfig = {
  /**
   * GPU: TSL shader + baked atlases (default). CPU: JS waveforms + instanced buffer updates for A/B.
   */
  depolarizationUseGpu: boolean;
  /**
   * 0 = very slow propagation (high ms / world unit), 100 = fast (low ms / unit).
   * Mapped ~240 → 12 ms/unit across the slider.
   */
  propagationSpeed: number;
  /**
   * Excitation window as a fraction of one spike cycle (`repeatPeriodMs`).
   * Higher = longer traveling band relative to time between spikes.
   */
  waveCycleFraction: number;
  /** Approximate wall-clock seconds between spike trains at the soma. */
  spikeSpacingSec: number;
  /** 0 = efflux close behind influx, 100 = more separation along the fiber. */
  effluxSeparation: number;
};

const defaultConfig: NeuronVisualConfig = {
  depolarizationUseGpu: true,
  propagationSpeed: 25,
  waveCycleFraction: 0.24,
  spikeSpacingSec: 3.5,
  effluxSeparation: 55,
};

export const { useParams, useActions, usePresets } =
  createConfigStore<NeuronVisualConfig>({
    default: defaultConfig,
  });

const deriveWaveformTiming = (params: NeuronVisualConfig) => {
  const conductionMsPerWorldUnit = Math.round(
    MathUtils.lerp(240, 12, params.propagationSpeed / 100),
  );
  const repeatPeriodMs = Math.round(
    params.spikeSpacingSec * DEFAULT_PHASE_MS_PER_WALL_MS * 1000,
  );
  const maxWaveMs = Math.floor(repeatPeriodMs * 0.5);
  const waveformDurationMs = MathUtils.clamp(
    params.waveCycleFraction * repeatPeriodMs,
    120,
    Math.max(160, maxWaveMs),
  );
  const effluxLagBandFraction = MathUtils.lerp(
    0.38,
    0.72,
    params.effluxSeparation / 100,
  );
  return {
    conductionMsPerWorldUnit,
    effluxLagBandFraction,
    waveformDurationMs,
    repeatPeriodMs,
  };
};

const NeuronVisual = (props: TVisualProps) => {
  void props;
  const params = useParams();
  const segments = useMemo(() => buildNeuronSegments(), []);

  const { effluxLagDistance, samplerOptions } = useMemo(() => {
    const derived = deriveWaveformTiming(params);
    const lagFrac = derived.effluxLagBandFraction;
    const lagMs =
      DEFAULT_DEPOLARIZATION_BAND_WIDTH *
      lagFrac *
      derived.conductionMsPerWorldUnit;
    return {
      effluxLagDistance: DEFAULT_DEPOLARIZATION_BAND_WIDTH * lagFrac,
      samplerOptions: {
        phaseMsPerWallMs: DEFAULT_PHASE_MS_PER_WALL_MS,
        conductionMsPerWorldUnit: derived.conductionMsPerWorldUnit,
        effluxLagMs: lagMs,
        approxParams: {
          ...DEFAULT_APPROX_AP_PARAMS,
          waveformDurationMs: derived.waveformDurationMs,
          repeatPeriodMs: derived.repeatPeriodMs,
        },
      },
    };
  }, [params]);

  const { samplerRef } = useNeuronWaveformSampler(samplerOptions);

  return (
    <>
      <pointLight
        position={[0, 2.2, -5.5]}
        intensity={42}
        distance={28}
        decay={2}
        color="#8da2ff"
      />
      <directionalLight position={[0, 2, -5]} intensity={3.2} color="#b8c5ff" />
      <NeuronModel segments={segments}>
        {params.depolarizationUseGpu ? (
          <DepolarizationParticlesGpu
            segments={segments}
            samplerRef={samplerRef}
            effluxEnabled
            effluxLagDistance={effluxLagDistance}
            effluxParticleFraction={0.35}
          />
        ) : (
          <DepolarizationParticlesCpu
            segments={segments}
            samplerRef={samplerRef}
            effluxEnabled
            effluxLagDistance={effluxLagDistance}
            effluxParticleFraction={0.35}
          />
        )}
      </NeuronModel>
    </>
  );
};

export default NeuronVisual;
