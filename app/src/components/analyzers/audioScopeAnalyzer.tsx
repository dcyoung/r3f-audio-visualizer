import { useMemo } from "react";

import { useMicrophoneLink } from "./analyzers/common";
import ScopeAnalyzer from "./analyzers/scope";
import AudioScopeAnalyzerControls from "./scopeAnalyzerControls";
import ControlledAudioSource from "../audio/audioSource";
import {
  AUDIO_SOURCE,
  buildAudio,
  buildAudioContext,
  useSelectAudioSource,
} from "../audio/sourceControls/common";
import MicrophoneAudioControls from "../audio/sourceControls/mic";

const InternalAudioScopeAnalyzer = ({
  audioSource,
}: {
  audioSource: "LIVE_STREAM" | "FILE_UPLOAD";
}) => {
  const audioCtx = useMemo(() => buildAudioContext(), []);
  const audio = useMemo(() => buildAudio(), []);
  const analyzer = useMemo(() => {
    return new ScopeAnalyzer(audio, audioCtx);
  }, [audio, audioCtx]);

  return (
    <>
      <ControlledAudioSource audio={audio} audioSource={audioSource} />
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
  const { audioSource } = useSelectAudioSource();

  if (audioSource === AUDIO_SOURCE.MICROPHONE) {
    return <InternalMicrophoneScopeAnalyzer />;
  }
  return <InternalAudioScopeAnalyzer audioSource={audioSource} />;
};

export default AudioFFTAnalyzer;
