import { useMemo } from "react";
import { FFTAnalyzerControls } from "@/components/analyzers/fftAnalyzerControls";
import { ControlledAudioSource } from "@/components/audio/audioSource";
import {
  AUDIO_SOURCE,
  buildAudio,
  buildAudioContext,
  type TAudioSource,
} from "@/components/audio/sourceControls/common";
import MicrophoneAudioControls from "@/components/audio/sourceControls/mic";
import ScreenShareControls from "@/components/audio/sourceControls/screenshare";
import {
  useMediaStreamLink,
  type TAnalyzerInputControl,
} from "@/lib/analyzers/common";
import FFTAnalyzer from "@/lib/analyzers/fft";
import ScopeAnalyzer from "@/lib/analyzers/scope";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import { useAudio } from "@/lib/appState";

import { AudioScopeAnalyzerControls } from "./scopeAnalyzerControls";

const buildScopeAnalyzer = () => {
  const audioCtx = buildAudioContext();
  const audio = buildAudio();
  return {
    audio,
    analyzer: new ScopeAnalyzer(audio, audioCtx),
  };
};

const buildFFTAnalyzer = (volume: number) => {
  const audioCtx = buildAudioContext();
  const audio = buildAudio();
  return {
    audio,
    analyzer: new FFTAnalyzer(audio, audioCtx, volume),
  };
};

const ControlledMicAnalyzer = ({
  audio,
  analyzer,
}: {
  audio: HTMLAudioElement;
  analyzer: TAnalyzerInputControl;
}) => {
  const { onDisabled, onStreamCreated } = useMediaStreamLink(audio, analyzer);
  return (
    <MicrophoneAudioControls
      audio={audio}
      onDisabled={onDisabled}
      onStreamCreated={onStreamCreated}
    />
  );
};

const ControlledScreenShareAnalyzer = ({
  audio,
  analyzer,
}: {
  audio: HTMLAudioElement;
  analyzer: TAnalyzerInputControl;
}) => {
  const { onDisabled, onStreamCreated } = useMediaStreamLink(audio, analyzer);
  return (
    <ScreenShareControls
      audio={audio}
      onDisabled={onDisabled}
      onStreamCreated={onStreamCreated}
    />
  );
};

const isMediaStream = (source: TAudioSource) => {
  switch (source) {
    case AUDIO_SOURCE.MICROPHONE:
    case AUDIO_SOURCE.SCREEN_SHARE:
      return true;
    case AUDIO_SOURCE.SOUNDCLOUD:
    case AUDIO_SOURCE.FILE_UPLOAD:
      return false;
    default:
      return source satisfies never;
  }
};

const ControlledAnalyzer = ({
  mode,
  audioSource,
}: {
  mode: typeof APPLICATION_MODE.AUDIO | typeof APPLICATION_MODE.AUDIO_SCOPE;
  audioSource: TAudioSource;
}) => {
  const { audio, analyzer } = useMemo(() => {
    switch (mode) {
      case APPLICATION_MODE.AUDIO:
        return buildFFTAnalyzer(isMediaStream(audioSource) ? 0.0 : 1.0);
      case APPLICATION_MODE.AUDIO_SCOPE:
        return buildScopeAnalyzer();
      default:
        return mode satisfies never;
    }
  }, [mode, audioSource]);

  return (
    <>
      {audioSource === AUDIO_SOURCE.MICROPHONE ? (
        <ControlledMicAnalyzer audio={audio} analyzer={analyzer} />
      ) : audioSource === AUDIO_SOURCE.SCREEN_SHARE ? (
        <ControlledScreenShareAnalyzer audio={audio} analyzer={analyzer} />
      ) : audioSource === AUDIO_SOURCE.SOUNDCLOUD ||
        audioSource === AUDIO_SOURCE.FILE_UPLOAD ? (
        <ControlledAudioSource audio={audio} audioSource={audioSource} />
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

const AudioAnalyzer = ({
  mode,
}: {
  mode: typeof APPLICATION_MODE.AUDIO | typeof APPLICATION_MODE.AUDIO_SCOPE;
}) => {
  const { source } = useAudio();

  return <ControlledAnalyzer mode={mode} audioSource={source} />;
};

export default AudioAnalyzer;
