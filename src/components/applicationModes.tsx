export enum EApplicationMode {
  WAVE_FORM,
  LIVE_STREAM,
  MICROPHONE,
}

export const getAppModeDisplayName = (mode: EApplicationMode): string => {
  switch (mode) {
    case EApplicationMode.WAVE_FORM:
      return "~ waveform";
    case EApplicationMode.LIVE_STREAM:
      return "🎧 livestream";
    case EApplicationMode.MICROPHONE:
      return "🎤 Microphone";
    default:
      throw new Error(`Unknown mode ${mode}`);
  }
};

export const getPlatformSupportedApplicationModes = (): EApplicationMode[] => {
  // Apple devices/browsers using WebKit do NOT support CrossOrigin Audio
  // see: https://bugs.webkit.org/show_bug.cgi?id=195043
  return navigator.platform.toLowerCase().startsWith("ip")
    ? [EApplicationMode.WAVE_FORM, EApplicationMode.MICROPHONE]
    : [
        EApplicationMode.WAVE_FORM,
        EApplicationMode.LIVE_STREAM,
        EApplicationMode.MICROPHONE,
      ];
};

export const isAudioMode = (mode: EApplicationMode): boolean => {
  switch (mode) {
    case EApplicationMode.WAVE_FORM:
      return false;
    case EApplicationMode.LIVE_STREAM:
    case EApplicationMode.MICROPHONE:
      return true;
    default:
      throw new Error(`Unknown mode ${mode}`);
  }
};
