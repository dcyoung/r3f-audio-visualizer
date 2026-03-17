import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EnergyMeasureOptions,
  OctaveBandModeMap,
  type OctaveBandMode,
} from "@/lib/analyzers/fft";
import { useAnalyzerFFT, useAppStateActions } from "@/lib/appState";
import { COORDINATE_MAPPER_REGISTRY } from "@/lib/mappers/coordinateMappers/registry";

import { SelectRow, SliderField } from "../common";
import { AudioSourceControls, AudioSourceSelect } from "./common";

const FFTAnalyzerControls = () => {
  const { octaveBandMode, energyMeasure } = useAnalyzerFFT();
  const { setAnalyzerFFT } = useAppStateActions();
  const mapper = COORDINATE_MAPPER_REGISTRY.data.hooks.useInstance();
  const { setParams } = COORDINATE_MAPPER_REGISTRY.data.hooks.useActions();
  return (
    <div className="space-y-4">
      <SliderField
        label="Amplitude"
        value={mapper.params.amplitude}
        displayValue={mapper.params.amplitude.toFixed(2)}
        min={0.0}
        max={5.0}
        step={0.01}
        onChange={(v) => setParams({ amplitude: v })}
      />
      <SelectRow label="Octave Bands">
        <Select
          defaultValue={String(octaveBandMode)}
          onValueChange={(v) =>
            setAnalyzerFFT({
              octaveBandMode: Number(v) as OctaveBandMode,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={OctaveBandModeMap[octaveBandMode]} />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {Object.entries(OctaveBandModeMap).map((v) => (
              <SelectItem
                value={v[0]}
                key={v[1]}
                aria-selected={v[0] === octaveBandMode.toString()}
              >
                {v[1]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SelectRow>
      <SelectRow label="Energy">
        <Select
          defaultValue={energyMeasure}
          onValueChange={(v) => {
            setAnalyzerFFT({
              energyMeasure: v ?? energyMeasure,
            });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={energyMeasure} />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {EnergyMeasureOptions.map((v) => (
              <SelectItem value={v} key={v} aria-selected={v === energyMeasure}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SelectRow>
    </div>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
    {children}
  </span>
);

export const AudioModeControls = () => {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <SectionLabel>Source</SectionLabel>
        <AudioSourceSelect />
        <AudioSourceControls />
      </div>
      <div className="space-y-3">
        <SectionLabel>Analyzer</SectionLabel>
        <FFTAnalyzerControls />
      </div>
    </div>
  );
};
