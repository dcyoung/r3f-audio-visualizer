import { useEffect, useMemo } from "react";
import ControlledAudioSource from "../audio/audioSource";
import {
  AudioSource,
  AUDIO_SOURCE,
  useSelectAudioSource,
} from "../audio/sourceControls/common";
import MicrophoneAudioControls from "../audio/sourceControls/mic";
import { useAudio, useAudioContext } from "../audio/sourceControls/useAudio";
import { useMicrophoneLink } from "./analyzers/common";
import ScopeAnalyzer from "./analyzers/scope";
import AudioScopeAnalyzerControls from "./scopeAnalyzerControls";

interface InternalAudioScopeAnalyzerProps {
  audioSource: AudioSource;
}
const InternalAudioScopeAnalyzer = ({
  audioSource,
}: InternalAudioScopeAnalyzerProps): JSX.Element => {
  if (audioSource === AUDIO_SOURCE.MICROPHONE) {
    throw new Error(
      "Use InternalMicrophoneScopeAnalyzer for microphone inputs."
    );
  }
  const { audioCtx } = useAudioContext();
  const { audio } = useAudio();

  const analyzer = useMemo(() => {
    return new ScopeAnalyzer(audio, audioCtx);
  }, [audio, audioCtx]);

  return (
    <>
      <ControlledAudioSource
        audio={audio}
        audioSource={audioSource as unknown as AudioSource}
      />
      <AudioScopeAnalyzerControls analyzer={analyzer} />
    </>
  );
};

interface InternalMicrophoneScopeAnalyzerProps {}
const InternalMicrophoneScopeAnalyzer =
  ({}: InternalMicrophoneScopeAnalyzerProps): JSX.Element => {
    const { audioCtx } = useAudioContext();
    const { audio } = useAudio();

    const analyzer = useMemo(() => {
      return new ScopeAnalyzer(audio, audioCtx);
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
        <AudioScopeAnalyzerControls analyzer={analyzer} />
      </>
    );
  };

export interface AudioScopeAnalyzerProps {}
const AudioFFTAnalyzer = ({}: AudioScopeAnalyzerProps): JSX.Element => {
  const audioSource = useSelectAudioSource();

  return (audioSource as unknown as AudioSource) === AUDIO_SOURCE.MICROPHONE ? (
    <InternalMicrophoneScopeAnalyzer />
  ) : (
    <InternalAudioScopeAnalyzer
      audioSource={audioSource as unknown as AudioSource}
    />
  );
};

export default AudioFFTAnalyzer;
