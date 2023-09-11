import { useMemo } from "react";

import FFTAnalyzerControls from "@/components/analyzers/fftAnalyzerControls";
import ControlledAudioSource from "@/components/audio/audioSource";
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

const InternalAudioFFTAnalyzer = ({
  audioSource,
}: {
  audioSource: "SOUNDCLOUD" | "FILE_UPLOAD";
}) => {
  const audioCtx = useMemo(() => buildAudioContext(), []);
  const audio = useMemo(() => buildAudio(), []);
  const analyzer = useMemo(() => {
    console.log("Creating analyzer...");
    const out = new FFTAnalyzer(audio, audioCtx);
    out.volume = 1.0;
    return out;
  }, [audio, audioCtx]);

  return (
    <>
      <ControlledAudioSource audio={audio} audioSource={audioSource} />
      <FFTAnalyzerControls analyzer={analyzer} />
    </>
  );
};

const InternalMediaStreamFFTAnalyzer = ({
  audioSource,
}: {
  audioSource: "MICROPHONE" | "SCREEN_SHARE";
}) => {
  const audioCtx = useMemo(() => buildAudioContext(), []);
  const audio = useMemo(() => buildAudio(), []);
  const analyzer = useMemo(() => {
    const out = new FFTAnalyzer(audio, audioCtx);
    out.volume = 0.0;
    return out;
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
      <FFTAnalyzerControls analyzer={analyzer} />
    </>
  );
};

const AudioFFTAnalyzer = () => {
  const { audioSource } = useAudioSourceContext();

  switch (audioSource) {
    case AUDIO_SOURCE.SOUNDCLOUD:
    case AUDIO_SOURCE.FILE_UPLOAD:
      return <InternalAudioFFTAnalyzer audioSource={audioSource} />;
    case AUDIO_SOURCE.MICROPHONE:
    case AUDIO_SOURCE.SCREEN_SHARE:
      return <InternalMediaStreamFFTAnalyzer audioSource={audioSource} />;
    default:
      return audioSource satisfies never;
  }
};

export default AudioFFTAnalyzer;
