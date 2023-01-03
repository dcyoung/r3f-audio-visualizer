export const APPLICATION_MODE = {
  WAVE_FORM: "WAVE_FORM",
  LIVE_STREAM: "LIVE_STREAM",
  MICROPHONE: "MICROPHONE",
} as const;

type ObjectValues<T> = T[keyof T];
export type ApplicationMode = ObjectValues<typeof APPLICATION_MODE>;

export const getAppModeDisplayName = (mode: ApplicationMode): string => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return "~ waveform";
    case APPLICATION_MODE.LIVE_STREAM:
      return "🎧 livestream";
    case APPLICATION_MODE.MICROPHONE:
      return "🎤 Microphone";
    default:
      throw new Error(`Unknown mode ${mode}`);
  }
};

export const getPlatformSupportedApplicationModes = (): ApplicationMode[] => {
  // Apple devices/browsers using WebKit do NOT support CrossOrigin Audio
  // see: https://bugs.webkit.org/show_bug.cgi?id=195043
  return navigator.platform.toLowerCase().startsWith("ip")
    ? [APPLICATION_MODE.WAVE_FORM, APPLICATION_MODE.MICROPHONE]
    : [
        APPLICATION_MODE.WAVE_FORM,
        APPLICATION_MODE.LIVE_STREAM,
        APPLICATION_MODE.MICROPHONE,
      ];
};

export const isAudioMode = (mode: ApplicationMode): boolean => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return false;
    case APPLICATION_MODE.LIVE_STREAM:
    case APPLICATION_MODE.MICROPHONE:
      return true;
    default:
      throw new Error(`Unknown mode ${mode}`);
  }
};
