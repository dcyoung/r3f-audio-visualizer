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

const useAudio = (
  mode: typeof APPLICATION_MODE.AUDIO | typeof APPLICATION_MODE.AUDIO_SCOPE,
) => {
  return useMemo(() => {
    const audioCtx = buildAudioContext();
    const audio = buildAudio();
    return {
      audio,
      analyzer: (() => {
        console.log("Creating analyzer...");
        switch (mode) {
          case APPLICATION_MODE.AUDIO:
            return new FFTAnalyzer(audio, audioCtx, 0.0);
          case APPLICATION_MODE.AUDIO_SCOPE:
            return new ScopeAnalyzer(audio, audioCtx);
          default:
            return mode satisfies never;
        }
      })(),
    };
  }, [mode]);
};

const InternalAudioAnalyzer = ({
  mode,
  audioSource,
}: {
  mode: typeof APPLICATION_MODE.AUDIO | typeof APPLICATION_MODE.AUDIO_SCOPE;
  audioSource: typeof AUDIO_SOURCE.SOUNDCLOUD | typeof AUDIO_SOURCE.FILE_UPLOAD;
}) => {
  const { audio, analyzer } = useAudio(mode);

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
  const { audio, analyzer } = useAudio(mode);
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

const AudioAnalyzer = ({
  mode,
}: {
  mode: typeof APPLICATION_MODE.AUDIO | typeof APPLICATION_MODE.AUDIO_SCOPE;
}) => {
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
