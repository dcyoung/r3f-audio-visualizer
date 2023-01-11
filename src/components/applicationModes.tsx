export const APPLICATION_MODE = {
  WAVE_FORM: "WAVE_FORM",
  NOISE: "NOISE",
  AUDIO: "AUDIO",
} as const;

type ObjectValues<T> = T[keyof T];
export type ApplicationMode = ObjectValues<typeof APPLICATION_MODE>;

export const getAppModeDisplayName = (mode: ApplicationMode): string => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return "~ waveform";
    case APPLICATION_MODE.AUDIO:
      return "🎧 audio";
    case APPLICATION_MODE.NOISE:
      return "x noise func";
    default:
      throw new Error(`Unknown mode ${mode}`);
  }
};
