import { Slider } from "@/components/ui/slider";
import { useAppStateActions, useMappers } from "@/lib/appState";
import { CoordinateMapper_Noise } from "@/lib/mappers/coordinateMappers/noise";
import { RefreshCcw } from "lucide-react";

import { ValueLabel } from "../common";

export const NoiseGeneratorModeControls = () => {
  const { coordinateMapperNoise: mapper } = useMappers();
  const params = mapper.params;
  const { setMappers } = useAppStateActions();
  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <div className="flex w-full items-center justify-between">
        <span>Noise</span>
        <RefreshCcw
          className="pointer-events-auto cursor-pointer"
          onClick={() =>
            setMappers({ coordinateMapperNoise: new CoordinateMapper_Noise() })
          }
        />
      </div>
      <ValueLabel label="Amplitude" value={params.amplitude.toFixed(2)} />
      <Slider
        defaultValue={[params.amplitude]}
        value={[params.amplitude]}
        min={0.0}
        max={5.0}
        step={0.01}
        onValueChange={(e) =>
          setMappers({
            coordinateMapperNoise: mapper.clone({ amplitude: e[0] }),
          })
        }
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
        onValueChange={(e) =>
          setMappers({
            coordinateMapperNoise: mapper.clone({ spatialScale: e[0] }),
          })
        }
      />
      <ValueLabel label="Time Scale" value={params.timeScale.toFixed(2)} />
      <Slider
        defaultValue={[params.timeScale]}
        value={[params.timeScale]}
        min={0.01}
        max={2.0}
        step={0.01}
        onValueChange={(e) =>
          setMappers({
            coordinateMapperNoise: mapper.clone({ timeScale: e[0] }),
          })
        }
      />
      <ValueLabel label="Iteration Count" value={params.nIterations} />
      <Slider
        defaultValue={[params.nIterations]}
        value={[params.nIterations]}
        min={1}
        max={16}
        step={1}
        onValueChange={(e) =>
          setMappers({
            coordinateMapperNoise: mapper.clone({ nIterations: e[0] }),
          })
        }
      />
    </div>
  );
};
