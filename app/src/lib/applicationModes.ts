export const APPLICATION_MODE = {
  WAVE_FORM: "WAVE_FORM",
  NOISE: "NOISE",
  AUDIO: "AUDIO",
  AUDIO_SCOPE: "AUDIO_SCOPE",
} as const;

type ObjectValues<T> = T[keyof T];
export type ApplicationMode = ObjectValues<typeof APPLICATION_MODE>;

export const isAudioMode = (mode: ApplicationMode) => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
    case APPLICATION_MODE.NOISE:
      return false;
    case APPLICATION_MODE.AUDIO:
    case APPLICATION_MODE.AUDIO_SCOPE:
      return true;
    default:
      return mode satisfies never;
  }
};

export const getPlatformSupportedApplicationModes = (): ApplicationMode[] => {
  return [
    APPLICATION_MODE.WAVE_FORM,
    APPLICATION_MODE.NOISE,
    APPLICATION_MODE.AUDIO,
    /* Disabled until bugs can be resolved */
    // APPLICATION_MODE.AUDIO_SCOPE,
  ];
};

export const isCameraMode = (mode: ApplicationMode) => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
    case APPLICATION_MODE.NOISE:
    case APPLICATION_MODE.AUDIO:
      return true;
    case APPLICATION_MODE.AUDIO_SCOPE:
      return false;
    default:
      return mode satisfies never;
  }
};
