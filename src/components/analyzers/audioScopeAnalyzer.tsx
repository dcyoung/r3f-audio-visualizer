import { useEffect, useMemo } from "react";
import ControlledAudioSource from "../audio/audioSource";
import {
  AudioSource,
  AUDIO_SOURCE,
  useSelectAudioSource,
} from "../audio/sourceControls/common";
import MicrophoneAudioControls from "../audio/sourceControls/mic";
import { useMicrophoneLink } from "./analyzers/common";
import ScopeAnalyzer from "./analyzers/scope";
import AudioScopeAnalyzerControls from "./scopeAnalyzerControls";

interface InternalAudioScopeAnalyzerProps {
  audioSource: AudioSource;
}
const InternalAudioScopeAnalyzer = ({
  audioSource,
}: InternalAudioScopeAnalyzerProps): JSX.Element => {
  if (audioSource === AUDIO_SOURCE.MICROPHONE) {
    throw new Error(
      "Use InternalMicrophoneScopeAnalyzer for microphone inputs."
    );
  }
  const audio = useMemo(() => {
    const node = new Audio();
    node.crossOrigin = "anonymous";
    return node;
  }, []);

  const analyzer = useMemo(() => {
    return new ScopeAnalyzer(audio);
  }, [audio]);

  // useEffect(() => {
  //   analyzer.volume =
  //     (audioSource as unknown as AudioSource) === AUDIO_SOURCE.MICROPHONE
  //       ? 0.0
  //       : 1.0;
  // }, [analyzer, audioSource]);

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
      <AudioScopeAnalyzerControls analyzer={analyzer} />
    </>
  );
};

interface InternalMicrophoneScopeAnalyzerProps {}
const InternalMicrophoneScopeAnalyzer =
  ({}: InternalMicrophoneScopeAnalyzerProps): JSX.Element => {
    const audio = useMemo(() => {
      const node = new Audio();
      node.crossOrigin = "anonymous";
      return node;
    }, []);

    const analyzer = useMemo(() => {
      return new ScopeAnalyzer(audio);
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
        <AudioScopeAnalyzerControls analyzer={analyzer} />
      </>
    );
  };

export interface AudioScopeAnalyzerProps {}
const AudioFFTAnalyzer = ({}: AudioScopeAnalyzerProps): JSX.Element => {
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
