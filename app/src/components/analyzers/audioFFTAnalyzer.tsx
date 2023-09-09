import { useMemo } from "react";

import { useMicrophoneLink } from "./analyzers/common";
import FFTAnalyzer from "./analyzers/fft";
import FFTAnalyzerControls from "./fftAnalyzerControls";
import ControlledAudioSource from "../audio/audioSource";
import {
  AUDIO_SOURCE,
  buildAudio,
  buildAudioContext,
  useSelectAudioSource,
} from "../audio/sourceControls/common";
import MicrophoneAudioControls from "../audio/sourceControls/mic";

const InternalAudioFFTAnalyzer = ({
  audioSource,
}: {
  audioSource: "LIVE_STREAM" | "FILE_UPLOAD";
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

const InternalMicrophoneFFTAnalyzer = () => {
  const audioCtx = useMemo(() => buildAudioContext(), []);
  const audio = useMemo(() => buildAudio(), []);
  const analyzer = useMemo(() => {
    const out = new FFTAnalyzer(audio, audioCtx);
    out.volume = 0.0;
    return out;
  }, [audio, audioCtx]);

  const { onDisabled, onStreamCreated } = useMicrophoneLink(audio, analyzer);

  return (
    <>
      <MicrophoneAudioControls
        audio={audio}
        onDisabled={onDisabled}
        onStreamCreated={onStreamCreated}
      />
      <FFTAnalyzerControls analyzer={analyzer} />
    </>
  );
};

const AudioFFTAnalyzer = () => {
  const { audioSource } = useSelectAudioSource();

  if (audioSource === AUDIO_SOURCE.MICROPHONE) {
    return <InternalMicrophoneFFTAnalyzer />;
  }
  return <InternalAudioFFTAnalyzer audioSource={audioSource} />;
};

export default AudioFFTAnalyzer;
