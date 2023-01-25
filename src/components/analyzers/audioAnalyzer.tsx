import { folder, useControls } from "leva";
import { useEffect, useMemo } from "react";
import ControlledAudioSource from "../audio/audioSource";
import {
  AudioSource,
  AUDIO_SOURCE,
  getAnalyzerSourceDisplayName,
  getPlatformSupportedAudioSources,
} from "../audio/sourceControls/common";
import MicrophoneAudioControls from "../audio/sourceControls/mic";
import AnalyzerControls from "./controls";
import FFTAnalyzer from "./analyzers/fft";

interface InternalAudioAnalyzerProps {
  audioSource: AudioSource;
}
const InternalAudioAnalyzer = ({
  audioSource,
}: InternalAudioAnalyzerProps): JSX.Element => {
  if (audioSource === AUDIO_SOURCE.MICROPHONE) {
    throw new Error("Use MicrophoneAnalzyer for microphone inputs.");
  }
  const audio = useMemo(() => {
    const node = new Audio();
    node.crossOrigin = "anonymous";
    return node;
  }, []);

  const analyzer = useMemo(() => {
    return new FFTAnalyzer(audio);
  }, [audio]);

  useEffect(() => {
    analyzer.volume =
      (audioSource as unknown as AudioSource) === AUDIO_SOURCE.MICROPHONE
        ? 0.0
        : 1.0;
  }, [analyzer, audioSource]);

  useEffect(() => {
    return () => {
      console.log("REMOVING");
      audio.pause();
      audio.remove();
    };
  }, [audio]);

  return (
    <>
      <ControlledAudioSource
        audio={audio}
        audioSource={audioSource as unknown as AudioSource}
      />
      <AnalyzerControls analyzer={analyzer} />
    </>
  );
};

export function useMicrophoneLink(
  audio: HTMLAudioElement,
  analyzer: FFTAnalyzer
) {
  return {
    onMicDisabled: () => {
      analyzer.disconnectInputs();
    },
    onStreamCreated: (stream: MediaStream) => {
      // Disable any audio
      audio.pause();
      // create stream using audio context
      const streamSrc = analyzer._audioCtx.createMediaStreamSource(stream);
      // connect microphone stream to analyzer
      analyzer.connectInput(streamSrc);
      // mute output to prevent feedback loops from the speakers
      analyzer.volume = 0.0;
    },
  };
}

interface InternalMicrophoneAnalyzerProps {}
const InternalMicrophoneAnalyzer =
  ({}: InternalMicrophoneAnalyzerProps): JSX.Element => {
    const audio = useMemo(() => {
      const node = new Audio();
      node.crossOrigin = "anonymous";
      return node;
    }, []);

    const analyzer = useMemo(() => {
      const out = new FFTAnalyzer(audio);
      out.volume = 0.0;
      return out;
    }, [audio]);

    const { onMicDisabled, onStreamCreated } = useMicrophoneLink(
      audio,
      analyzer
    );

    useEffect(() => {
      return () => {
        console.log("REMOVING");
        audio.pause();
        audio.remove();
      };
    }, [audio]);

    return (
      <>
        <MicrophoneAudioControls
          audio={audio}
          onMicDisabled={onMicDisabled}
          onStreamCreated={onStreamCreated}
        />
        <AnalyzerControls analyzer={analyzer} />
      </>
    );
  };

export interface AudioAnalyzerProps {}
const AVAILABLE_SOURCES = getPlatformSupportedAudioSources();
const AudioAnalyzer = ({}: AudioAnalyzerProps): JSX.Element => {
  const { audioSource } = useControls({
    Audio: folder({
      audioSource: {
        value: AVAILABLE_SOURCES[0],
        options: AVAILABLE_SOURCES.reduce(
          (o, src) => ({ ...o, [getAnalyzerSourceDisplayName(src)]: src }),
          {}
        ),
        order: -100,
      },
    }),
  });

  return (audioSource as unknown as AudioSource) === AUDIO_SOURCE.MICROPHONE ? (
    <InternalMicrophoneAnalyzer />
  ) : (
    <InternalAudioAnalyzer
      audioSource={audioSource as unknown as AudioSource}
    />
  );
};

export default AudioAnalyzer;
