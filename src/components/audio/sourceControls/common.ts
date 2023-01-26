export interface AudioSourceControlsProps {
  // audioRef: MutableRefObject<HTMLAudioElement>;
  audio: HTMLAudioElement;
}

export const AUDIO_SOURCE = {
  LIVE_STREAM: "LIVE_STREAM",
  MICROPHONE: "MICROPHONE",
  FILE_UPLOAD: "FILE_UPLOAD",
} as const;

type ObjectValues<T> = T[keyof T];
export type AudioSource = ObjectValues<typeof AUDIO_SOURCE>;

export const getAnalyzerSourceDisplayName = (source: AudioSource): string => {
  switch (source) {
    case AUDIO_SOURCE.LIVE_STREAM:
      return "🎧 livestream";
    case AUDIO_SOURCE.MICROPHONE:
      return "🎤 Microphone";
    case AUDIO_SOURCE.FILE_UPLOAD:
      return "📁 File Upload";
    default:
      throw new Error(`Unknown source ${source}`);
  }
};

export const getPlatformSupportedAudioSources = (): AudioSource[] => {
  // Apple devices/browsers using WebKit do NOT support CrossOrigin Audio
  // see: https://bugs.webkit.org/show_bug.cgi?id=195043
  return navigator.platform.toLowerCase().startsWith("ip")
    ? [AUDIO_SOURCE.FILE_UPLOAD, AUDIO_SOURCE.MICROPHONE]
    : [
        AUDIO_SOURCE.LIVE_STREAM,
        AUDIO_SOURCE.FILE_UPLOAD,
        AUDIO_SOURCE.MICROPHONE,
      ];
};
