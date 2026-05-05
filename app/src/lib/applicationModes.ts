export const APPLICATION_MODE = {
  WAVE_FORM: "WAVE_FORM",
  NOISE: "NOISE",
  AUDIO: "AUDIO",
  AUDIO_SCOPE: "AUDIO_SCOPE",
  PARTICLE_NOISE: "PARTICLE_NOISE",
  NEURON: "NEURON",
} as const;

type ObjectValues<T> = T[keyof T];
export type TApplicationMode = ObjectValues<typeof APPLICATION_MODE>;

export const isAudioMode = (mode: TApplicationMode) => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
    case APPLICATION_MODE.NOISE:
    case APPLICATION_MODE.PARTICLE_NOISE:
    case APPLICATION_MODE.NEURON:
      return false;
    case APPLICATION_MODE.AUDIO:
    case APPLICATION_MODE.AUDIO_SCOPE:
      return true;
    default:
      return mode satisfies never;
  }
};

export const isAudioScopeMode = (mode: TApplicationMode) =>
  mode === APPLICATION_MODE.AUDIO_SCOPE;

export const getPlatformSupportedApplicationModes = () => {
  return [
    APPLICATION_MODE.WAVE_FORM,
    APPLICATION_MODE.NOISE,
    APPLICATION_MODE.AUDIO,
    APPLICATION_MODE.AUDIO_SCOPE,
    APPLICATION_MODE.NEURON,
  ];
};

export const isCameraMode = (mode: TApplicationMode) => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
    case APPLICATION_MODE.NOISE:
    case APPLICATION_MODE.AUDIO:
    case APPLICATION_MODE.PARTICLE_NOISE:
    case APPLICATION_MODE.NEURON:
      return true;
    case APPLICATION_MODE.AUDIO_SCOPE:
      return false;
    default:
      return mode satisfies never;
  }
};
