import { MutableRefObject } from "react";
import FFTAnalyzer from "../fft";

export interface AnalyzerSourceControlsProps {
  audioRef: MutableRefObject<HTMLAudioElement>;
  analyzerRef: MutableRefObject<FFTAnalyzer>;
  dirtyFlip?: boolean;
}

export const AUDIO_ANALYZER_SOURCE = {
  LIVE_STREAM: "LIVE_STREAM",
  MICROPHONE: "MICROPHONE",
  FILE_UPLOAD: "FILE_UPLOAD",
} as const;

type ObjectValues<T> = T[keyof T];
export type AudioAnalyzerSource = ObjectValues<typeof AUDIO_ANALYZER_SOURCE>;

export const getAnalyzerSourceDisplayName = (
  source: AudioAnalyzerSource
): string => {
  switch (source) {
    case AUDIO_ANALYZER_SOURCE.LIVE_STREAM:
      return "🎧 livestream";
    case AUDIO_ANALYZER_SOURCE.MICROPHONE:
      return "🎤 Microphone";
    case AUDIO_ANALYZER_SOURCE.FILE_UPLOAD:
      return "📁 File Upload";
    default:
      throw new Error(`Unknown source ${source}`);
  }
};

export const getPlatformSupportedAnalyzerSources =
  (): AudioAnalyzerSource[] => {
    // Apple devices/browsers using WebKit do NOT support CrossOrigin Audio
    // see: https://bugs.webkit.org/show_bug.cgi?id=195043
    return navigator.platform.toLowerCase().startsWith("ip")
      ? [AUDIO_ANALYZER_SOURCE.FILE_UPLOAD, AUDIO_ANALYZER_SOURCE.MICROPHONE]
      : [
          AUDIO_ANALYZER_SOURCE.LIVE_STREAM,
          AUDIO_ANALYZER_SOURCE.FILE_UPLOAD,
          AUDIO_ANALYZER_SOURCE.MICROPHONE,
        ];
  };
