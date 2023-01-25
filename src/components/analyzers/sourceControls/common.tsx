import { MutableRefObject } from "react";
import FFTAnalyzer from "../fft";

export interface AnalyzerSourceControlsProps {
  audioRef: MutableRefObject<HTMLAudioElement>;
  analyzerRef: MutableRefObject<FFTAnalyzer>;
  dirtyFlip?: boolean;
}
