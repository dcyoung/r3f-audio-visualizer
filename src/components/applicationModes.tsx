const APPLICATION_MODE_WAVE_FORM = "∿ waveform";
const APPLICATION_MODE_LIVE_STREAM = "🎧 livestream";
const APPLICATION_MODE_MICROPHONE = "🎤 Microphone";

const getSupportedApplicationModes = (): string[] => {
  // Apple devices/browsers using WebKit do NOT support CrossOrigin Audio
  // see: https://bugs.webkit.org/show_bug.cgi?id=195043
  return navigator.platform.toLowerCase().startsWith("ip")
    ? [APPLICATION_MODE_WAVE_FORM, APPLICATION_MODE_MICROPHONE]
    : [
        APPLICATION_MODE_WAVE_FORM,
        APPLICATION_MODE_LIVE_STREAM,
        APPLICATION_MODE_MICROPHONE,
      ];
};

const isAudioMode = (mode: string): boolean => {
  return (
    mode === APPLICATION_MODE_LIVE_STREAM ||
    mode === APPLICATION_MODE_MICROPHONE
  );
};

export {
  APPLICATION_MODE_WAVE_FORM,
  APPLICATION_MODE_LIVE_STREAM,
  APPLICATION_MODE_MICROPHONE,
  getSupportedApplicationModes,
  isAudioMode,
};
