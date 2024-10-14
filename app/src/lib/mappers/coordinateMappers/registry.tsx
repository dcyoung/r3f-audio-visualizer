import Data from "./data";
import Noise from "./noise";
import Waveform from "./waveform";

export const COORDINATE_MAPPER_REGISTRY = {
  [Data.id]: Data,
  [Noise.id]: Noise,
  [Waveform.id]: Waveform,
};
