import { useMemo } from "react";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import { useMappers, useMode, useVisual } from "@/lib/appState";
import { type ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";

const DummyMapper: ICoordinateMapper = { map: () => 0, amplitude: 0 };
const useVisualParams = () => {
  const mode = useMode();
  const {
    coordinateMapperData,
    coordinateMapperNoise,
    coordinateMapperWaveform,
    ...rest
  } = useMappers();
  const coordinateMapper = useMemo(() => {
    switch (mode) {
      case APPLICATION_MODE.WAVE_FORM:
        return coordinateMapperWaveform;
      case APPLICATION_MODE.NOISE:
        return coordinateMapperNoise;
      case APPLICATION_MODE.AUDIO:
        return coordinateMapperData;
      case APPLICATION_MODE.AUDIO_SCOPE:
      case APPLICATION_MODE.PARTICLE_NOISE:
        return DummyMapper;
      default:
        return mode satisfies never;
    }
  }, [
    mode,
    coordinateMapperData,
    coordinateMapperNoise,
    coordinateMapperWaveform,
  ]);

  return {
    coordinateMapper,
    ...rest,
  };
};
const ModalVisual = () => {
  const visual = useVisual();
  const visualParams = useVisualParams();
  return <visual.ReactiveComponent {...visualParams} />;
};

export default ModalVisual;
