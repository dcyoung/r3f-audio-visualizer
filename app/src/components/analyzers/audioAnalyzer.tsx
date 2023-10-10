import { useMemo } from "react";

import { FFTAnalyzerControls } from "@/components/analyzers/fftAnalyzerControls";
import { ControlledAudioSource } from "@/components/audio/audioSource";
import {
  AUDIO_SOURCE,
  buildAudio,
  buildAudioContext,
} from "@/components/audio/sourceControls/common";
import MicrophoneAudioControls from "@/components/audio/sourceControls/mic";
import ScreenShareControls from "@/components/audio/sourceControls/screenshare";
import { useAudioSourceContext } from "@/context/audioSource";
import { useMediaStreamLink } from "@/lib/analyzers/common";
import FFTAnalyzer from "@/lib/analyzers/fft";
import ScopeAnalyzer from "@/lib/analyzers/scope";
import { APPLICATION_MODE } from "@/lib/applicationModes";

import { AudioScopeAnalyzerControls } from "./scopeAnalyzerControls";

const InternalAudioAnalyzer = ({
  mode,
  audioSource,
}: {
  mode: "AUDIO" | "AUDIO_SCOPE";
  audioSource: "SOUNDCLOUD" | "FILE_UPLOAD";
}) => {
  const audioCtx = useMemo(() => buildAudioContext(), [mode]);
  const audio = useMemo(() => buildAudio(), [mode]);
  const analyzer = useMemo(() => {
    console.log("Creating analyzer...");
    switch (mode) {
      case APPLICATION_MODE.AUDIO:
        const out = new FFTAnalyzer(audio, audioCtx);
        out.volume = 1.0;
        return out;
      case APPLICATION_MODE.AUDIO_SCOPE:
        return new ScopeAnalyzer(audio, audioCtx);
      default:
        return mode satisfies never;
    }
  }, [mode, audio, audioCtx]);

  return (
    <>
      <ControlledAudioSource audio={audio} audioSource={audioSource} />
      {analyzer instanceof FFTAnalyzer ? (
        <FFTAnalyzerControls analyzer={analyzer} />
      ) : analyzer instanceof ScopeAnalyzer ? (
        <AudioScopeAnalyzerControls analyzer={analyzer} />
      ) : (
        (analyzer satisfies never)
      )}
    </>
  );
};

const InternalMediaStreamAnalyzer = ({
  mode,
  audioSource,
}: {
  mode: "AUDIO" | "AUDIO_SCOPE";
  audioSource: "MICROPHONE" | "SCREEN_SHARE";
}) => {
  const audioCtx = useMemo(() => buildAudioContext(), []);
  const audio = useMemo(() => buildAudio(), []);
  const analyzer = useMemo(() => {
    console.log("Creating analyzer...");
    switch (mode) {
      case APPLICATION_MODE.AUDIO:
        const out = new FFTAnalyzer(audio, audioCtx);
        out.volume = 0.0;
        return out;
      case APPLICATION_MODE.AUDIO_SCOPE:
        return new ScopeAnalyzer(audio, audioCtx);
      default:
        return mode satisfies never;
    }
  }, [audio, audioCtx]);

  const { onDisabled, onStreamCreated } = useMediaStreamLink(audio, analyzer);

  return (
    <>
      {audioSource === AUDIO_SOURCE.MICROPHONE ? (
        <MicrophoneAudioControls
          audio={audio}
          onDisabled={onDisabled}
          onStreamCreated={onStreamCreated}
        />
      ) : audioSource === AUDIO_SOURCE.SCREEN_SHARE ? (
        <ScreenShareControls
          audio={audio}
          onDisabled={onDisabled}
          onStreamCreated={onStreamCreated}
        />
      ) : (
        (audioSource satisfies never)
      )}
      {analyzer instanceof FFTAnalyzer ? (
        <FFTAnalyzerControls analyzer={analyzer} />
      ) : analyzer instanceof ScopeAnalyzer ? (
        <AudioScopeAnalyzerControls analyzer={analyzer} />
      ) : (
        (analyzer satisfies never)
      )}
    </>
  );
};

const AudioAnalyzer = ({ mode }: { mode: "AUDIO" | "AUDIO_SCOPE" }) => {
  const { audioSource } = useAudioSourceContext();

  switch (audioSource) {
    case AUDIO_SOURCE.SOUNDCLOUD:
    case AUDIO_SOURCE.FILE_UPLOAD:
      return <InternalAudioAnalyzer mode={mode} audioSource={audioSource} />;
    case AUDIO_SOURCE.MICROPHONE:
    case AUDIO_SOURCE.SCREEN_SHARE:
      return (
        <InternalMediaStreamAnalyzer mode={mode} audioSource={audioSource} />
      );
    default:
      return audioSource satisfies never;
  }
};

export default AudioAnalyzer;
