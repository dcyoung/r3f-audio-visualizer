import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAppStateActions, useMappers } from "@/lib/appState";
import { CoordinateMapper_WaveformSuperposition } from "@/lib/mappers/coordinateMappers/waveform";
import { RefreshCcw } from "lucide-react";

import { ValueLabel } from "../common";

export const WaveformModeControls = () => {
  const { coordinateMapperWaveform: mapper } = useMappers();
  const params = mapper.params;
  const { setMappers } = useAppStateActions();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <div className="flex w-full items-center justify-between">
        <span>Wave Form</span>
        <RefreshCcw
          className="pointer-events-auto cursor-pointer"
          onClick={() =>
            setMappers({
              coordinateMapperWaveform:
                new CoordinateMapper_WaveformSuperposition(),
            })
          }
        />
      </div>
      <div className="flex w-full items-center justify-between">
        <Label>Double</Label>
        <Switch
          checked={params.waveformFrequenciesHz.length > 1}
          defaultChecked={params.waveformFrequenciesHz.length > 1}
          onCheckedChange={(e) => {
            setMappers({
              coordinateMapperWaveform: mapper.clone({
                waveformFrequenciesHz: e ? [2.0, 10] : [2.0],
              }),
            });
          }}
        />
      </div>
      <ValueLabel
        label="Max Amplitude"
        value={params.maxAmplitude.toFixed(2)}
      />
      <Slider
        defaultValue={[params.maxAmplitude]}
        min={0.0}
        max={5.0}
        step={0.01}
        onValueChange={(e) =>
          setMappers({
            coordinateMapperWaveform: mapper.clone({
              maxAmplitude: e[0],
            }),
          })
        }
      />
      {params.waveformFrequenciesHz.map((hz, i) => (
        <div key={`label_waveform_frequency_${i}`} className="w-full space-y-4">
          <ValueLabel
            label={`Wave #${i + 1} - Freq (hz)`}
            value={hz.toFixed(2)}
          />
          <Slider
            key={`slider_waveform_frequency_${i}`}
            defaultValue={[hz]}
            value={[hz]}
            min={2.0}
            max={i == 0 ? 10.0 : 30.0}
            step={0.05}
            onValueChange={(e) =>
              setMappers({
                coordinateMapperWaveform: mapper.clone({
                  waveformFrequenciesHz: params.waveformFrequenciesHz.map(
                    (v, j) => (i == j ? e[0] : v),
                  ),
                }),
              })
            }
          />
        </div>
      ))}
    </div>
  );
};
