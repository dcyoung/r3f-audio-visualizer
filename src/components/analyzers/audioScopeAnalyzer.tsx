import { useMemo } from "react";

import { useMicrophoneLink } from "./analyzers/common";
import ScopeAnalyzer from "./analyzers/scope";
import AudioScopeAnalyzerControls from "./scopeAnalyzerControls";
import ControlledAudioSource from "../audio/audioSource";
import {
  type AudioSource,
  AUDIO_SOURCE,
  buildAudio,
  buildAudioContext,
  useSelectAudioSource,
} from "../audio/sourceControls/common";
import MicrophoneAudioControls from "../audio/sourceControls/mic";

interface InternalAudioScopeAnalyzerProps {
  audioSource: AudioSource;
}
const InternalAudioScopeAnalyzer = ({
  audioSource,
}: InternalAudioScopeAnalyzerProps) => {
  if (audioSource === AUDIO_SOURCE.MICROPHONE) {
    throw new Error(
      "Use InternalMicrophoneScopeAnalyzer for microphone inputs."
    );
  }
  const audioCtx = useMemo(() => buildAudioContext(), []);
  const audio = useMemo(() => buildAudio(), []);
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

const InternalMicrophoneScopeAnalyzer = () => {
  const audioCtx = useMemo(() => buildAudioContext(), []);
  const audio = useMemo(() => buildAudio(), []);
  const analyzer = useMemo(() => {
    return new ScopeAnalyzer(audio, audioCtx);
  }, [audio, audioCtx]);

  const { onDisabled, onStreamCreated } = useMicrophoneLink(audio, analyzer);

  return (
    <>
      <MicrophoneAudioControls
        audio={audio}
        onDisabled={onDisabled}
        onStreamCreated={onStreamCreated}
      />
      <AudioScopeAnalyzerControls analyzer={analyzer} />
    </>
  );
};

const AudioFFTAnalyzer = () => {
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
