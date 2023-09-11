import { useMemo } from "react";

import AudioScopeAnalyzerControls from "@/components/analyzers/scopeAnalyzerControls";
import ControlledAudioSource from "@/components/audio/audioSource";
import {
  AUDIO_SOURCE,
  buildAudio,
  buildAudioContext,
} from "@/components/audio/sourceControls/common";
import MicrophoneAudioControls from "@/components/audio/sourceControls/mic";
import { useAudioSourceContext } from "@/context/audioSource";
import { useMediaStreamLink } from "@/lib/analyzers/common";
import ScopeAnalyzer from "@/lib/analyzers/scope";

const InternalAudioScopeAnalyzer = ({
  audioSource,
}: {
  audioSource: "SOUNDCLOUD" | "FILE_UPLOAD";
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

  const { onDisabled, onStreamCreated } = useMediaStreamLink(audio, analyzer);

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
  const { audioSource } = useAudioSourceContext();

  if (audioSource === AUDIO_SOURCE.MICROPHONE) {
    return <InternalMicrophoneScopeAnalyzer />;
  }
  return <InternalAudioScopeAnalyzer audioSource={audioSource} />;
};

export default AudioFFTAnalyzer;
