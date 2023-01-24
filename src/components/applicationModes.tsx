export const APPLICATION_MODE = {
  WAVE_FORM: "WAVE_FORM",
  NOISE: "NOISE",
  AUDIO_LIVE_STREAM: "AUDIO_LIVE_STREAM",
  AUDIO_MICROPHONE: "AUDIO_MICROPHONE",
} as const;

type ObjectValues<T> = T[keyof T];
export type ApplicationMode = ObjectValues<typeof APPLICATION_MODE>;

export const getAppModeDisplayName = (mode: ApplicationMode): string => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return "~ waveform";
    case APPLICATION_MODE.NOISE:
      return "x noise func";
    case APPLICATION_MODE.AUDIO_LIVE_STREAM:
      return "🎧 livestream";
    case APPLICATION_MODE.AUDIO_MICROPHONE:
      return "🎤 microphone";
    default:
      throw new Error(`Unknown mode ${mode}`);
  }
};

export const getPlatformSupportedApplicationModes = (): ApplicationMode[] => {
  // Apple devices/browsers using WebKit do NOT support CrossOrigin Audio
  // see: https://bugs.webkit.org/show_bug.cgi?id=195043
  return navigator.platform.toLowerCase().startsWith("ip")
    ? [
        APPLICATION_MODE.WAVE_FORM,
        APPLICATION_MODE.NOISE,
        APPLICATION_MODE.AUDIO_MICROPHONE,
      ]
    : [
        APPLICATION_MODE.WAVE_FORM,
        APPLICATION_MODE.NOISE,
        APPLICATION_MODE.AUDIO_LIVE_STREAM,
        APPLICATION_MODE.AUDIO_MICROPHONE,
      ];
};
