import { useEffect, useMemo } from "react";
import ControlledAudioSource from "../audio/audioSource";
import {
  AudioSource,
  AUDIO_SOURCE,
  useSelectAudioSource,
} from "../audio/sourceControls/common";
import MicrophoneAudioControls from "../audio/sourceControls/mic";
import FFTAnalyzerControls from "./fftAnalyzerControls";
import FFTAnalyzer from "./analyzers/fft";
import { useMicrophoneLink } from "./analyzers/common";
import { useAudio, useAudioContext } from "../audio/sourceControls/hooks";

interface InternalAudioAnalyzerProps {
  audioSource: AudioSource;
}

const InternalAudioFFTAnalyzer = ({
  audioSource,
}: InternalAudioAnalyzerProps): JSX.Element => {
  if (audioSource === AUDIO_SOURCE.MICROPHONE) {
    throw new Error("Use InternalMicrophoneFFTAnalyzer for microphone inputs.");
  }
  const { audioCtx } = useAudioContext();
  const { audio } = useAudio();
  const analyzer = useMemo(() => {
    return new FFTAnalyzer(audio, audioCtx);
  }, [audio, audioCtx]);

  useEffect(() => {
    analyzer.volume =
      (audioSource as unknown as AudioSource) === AUDIO_SOURCE.MICROPHONE
        ? 0.0
        : 1.0;
  }, [analyzer, audioSource]);

  return (
    <>
      <ControlledAudioSource
        audio={audio}
        audioSource={audioSource as unknown as AudioSource}
      />
      <FFTAnalyzerControls analyzer={analyzer} />
    </>
  );
};

interface InternalMicrophoneFFTAnalyzerProps {}
const InternalMicrophoneFFTAnalyzer =
  ({}: InternalMicrophoneFFTAnalyzerProps): JSX.Element => {
    const { audioCtx } = useAudioContext();
    const { audio } = useAudio();
    const analyzer = useMemo(() => {
      const out = new FFTAnalyzer(audio, audioCtx);
      out.volume = 0.0;
      return out;
    }, [audio, audioCtx]);

    const { onMicDisabled, onStreamCreated } = useMicrophoneLink(
      audio,
      analyzer
    );

    return (
      <>
        <MicrophoneAudioControls
          audio={audio}
          onMicDisabled={onMicDisabled}
          onStreamCreated={onStreamCreated}
        />
        <FFTAnalyzerControls analyzer={analyzer} />
      </>
    );
  };

export interface AudioFFTAnalyzerProps {}
const AudioFFTAnalyzer = ({}: AudioFFTAnalyzerProps): JSX.Element => {
  const audioSource = useSelectAudioSource();

  return (audioSource as unknown as AudioSource) === AUDIO_SOURCE.MICROPHONE ? (
    <InternalMicrophoneFFTAnalyzer />
  ) : (
    <InternalAudioFFTAnalyzer
      audioSource={audioSource as unknown as AudioSource}
    />
  );
};

export default AudioFFTAnalyzer;
