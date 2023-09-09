import { useMemo } from "react";

import AudioScopeAnalyzerControls from "@/components/analyzers/scopeAnalyzerControls";
import ControlledAudioSource from "@/components/audio/audioSource";
import {
  AUDIO_SOURCE,
  buildAudio,
  buildAudioContext,
  useSelectAudioSource,
} from "@/components/audio/sourceControls/common";
import MicrophoneAudioControls from "@/components/audio/sourceControls/mic";
import { useMicrophoneLink } from "@/lib/analyzers/common";
import ScopeAnalyzer from "@/lib/analyzers/scope";

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
