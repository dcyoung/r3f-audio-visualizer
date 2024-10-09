import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFFTAnalyzerContext,
  useFFTAnalyzerContextSetters,
} from "@/context/fftAnalyzer";
import {
  EnergyMeasureOptions,
  OctaveBandModeMap,
  type EnergyMeasure,
  type OctaveBandMode,
} from "@/lib/analyzers/fft";
import { useAppStateActions, useMappers } from "@/lib/appState";

import { ValueLabel } from "../common";
import { AudioSourceControls, AudioSourceSelect } from "./common";

const FFTAnalyzerControls = () => {
  const { octaveBandMode, energyMeasure } = useFFTAnalyzerContext();
  const { setOctaveBand, setEnergyMeasure } = useFFTAnalyzerContextSetters();
  const { coordinateMapperData: mapper } = useMappers();
  const { setMappers } = useAppStateActions();
  return (
    <div className="w-full space-y-4">
      <ValueLabel
        label="Amplitude"
        value={mapper.params.amplitude.toFixed(2)}
      />
      <Slider
        defaultValue={[mapper.params.amplitude]}
        value={[mapper.params.amplitude]}
        min={0.0}
        max={5.0}
        step={0.01}
        onValueChange={(e) =>
          setMappers({
            coordinateMapperData: mapper.clone({
              amplitude: e[0],
            }),
          })
        }
      />
      <div className="flex w-full items-center justify-between">
        <span>Octave Band Mode</span>

        <Select
          onValueChange={(v) => {
            setOctaveBand(Number(v) as OctaveBandMode);
          }}
        >
          <SelectTrigger className="max-w-1/2 w-[240px]">
            <SelectValue
              placeholder={OctaveBandModeMap[octaveBandMode]}
              defaultValue={octaveBandMode}
              className="w-full"
            />
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
      </div>
      <div className="flex w-full items-center justify-between">
        <span>Energy Measure</span>

        <Select
          onValueChange={(v) => {
            setEnergyMeasure(v as EnergyMeasure);
          }}
        >
          <SelectTrigger className="max-w-1/2 w-[240px]">
            <SelectValue
              placeholder={energyMeasure}
              defaultValue={energyMeasure}
              className="w-full"
            />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {EnergyMeasureOptions.map((v) => (
              <SelectItem value={v} key={v} aria-selected={v === energyMeasure}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const AudioModeControls = () => {
  return (
    <Tabs defaultValue="source" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="source" className="grow">
          Audio Source
        </TabsTrigger>
        <TabsTrigger value="analyzer" className="grow">
          Audio Analyzer
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="source"
        className="space-y-4 p-4"
        // className="flex flex-col items-start justify-start gap-4 py-2"
      >
        <AudioSourceSelect />
        <AudioSourceControls />
      </TabsContent>
      <TabsContent
        value="analyzer"
        // className="flex flex-col items-start justify-start gap-4"
      >
        <FFTAnalyzerControls />
      </TabsContent>
    </Tabs>
  );
};
