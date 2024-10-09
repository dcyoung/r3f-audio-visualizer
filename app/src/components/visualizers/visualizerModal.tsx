import { APPLICATION_MODE } from "@/lib/applicationModes";
import { useMappers, useMode } from "@/lib/appState";
import { type ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";

import { type TVisual } from "./registry";

const DummyMapper: ICoordinateMapper = { map: () => 0, amplitude: 0 };
const useScalarTracker = () => {
  const mode = useMode();
  const { energyTracker } = useMappers();
  switch (mode) {
    case APPLICATION_MODE.AUDIO:
      return energyTracker;
    default:
      return undefined;
  }
};
const useCoordinateMapper = () => {
  const mode = useMode();
  const {
    coordinateMapperWaveform,
    coordinateMapperNoise,
    coordinateMapperData,
  } = useMappers();
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
};
const ModalVisual = ({ visual }: { visual: TVisual }) => {
  const coordinateMapper = useCoordinateMapper();
  const scalarTracker = useScalarTracker();
  const { textureMapper, motionMapper } = useMappers();
  return (
    <visual.ReactiveComponent
      coordinateMapper={coordinateMapper}
      scalarTracker={scalarTracker ?? undefined}
      textureMapper={textureMapper}
      motionMapper={motionMapper}
    />
  );
};

export default ModalVisual;
