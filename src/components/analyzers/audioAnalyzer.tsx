import { folder, useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import {
  useAppStateActions,
  useEnergyInfo,
  useVisualSourceDataX,
} from "../appState";
import AudioSourceComponent from "../audio/audioSource";
import {
  AudioSource,
  AUDIO_SOURCE,
  getAnalyzerSourceDisplayName,
  getPlatformSupportedAudioSources,
} from "../audio/sourceControls/common";
import FFTAnalyzer, { EnergyMeasure } from "./fft";
import { AnalyzerSourceControlsProps } from "./sourceControls/common";
import FileSourceControls from "./sourceControls/file";
import LivestreamSourceControls from "./sourceControls/livestream";
import MicrophoneSourceControls from "./sourceControls/mic";

function useAnalyzerControls({
  audioRef,
  analyzerRef,
}: AnalyzerSourceControlsProps) {
  const [dirtyFlip, setDirtyFlip] = useState(true);
  const { octaveBands, energyMeasure } = useControls({
    Audio: folder({
      octaveBands: {
        value: 2,
        options: {
          "1/24th octave bands": 1,
          "1/12th octave bands": 2,
          "1/8th octave bands": 3,
          "1/6th octave bands": 4,
          "1/4th octave bands": 5,
          "1/3rd octave bands": 6,
          "Half octave bands": 7,
          "Full octave bands": 8,
        },
      },
      energyMeasure: {
        value: "overall",
        options: [
          "overall",
          "peak",
          "bass",
          "lowMid",
          "mid",
          "highMid",
          "treble",
        ],
      },
    }),
  });
  const freqData = useVisualSourceDataX();
  const energyInfo = useEnergyInfo();
  const { resizeVisualSourceData } = useAppStateActions();
  const animationRequestRef = useRef<number>(null!);

  /**
   * Transfers data from the analyzer to the target array
   */
  const animate = (): void => {
    if (!analyzerRef.current) {
      return;
    }
    const bars = analyzerRef.current.getBars();

    if (freqData.length != bars.length) {
      console.log(`Resizing ${bars.length}`);
      resizeVisualSourceData(bars.length);
      return;
    }

    energyInfo.current = analyzerRef.current.getEnergy(
      energyMeasure as EnergyMeasure
    );
    // console.log(energyInfo.current);

    bars.forEach(({ value }, index) => {
      freqData[index] = value;
    });
    animationRequestRef.current = requestAnimationFrame(animate);
  };

  /**
   * Re-Synchronize the animation loop if the target data destination changes.
   */
  useEffect(() => {
    if (animationRequestRef.current) {
      cancelAnimationFrame(animationRequestRef.current);
    }
    animationRequestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRequestRef.current);
  }, [freqData, energyMeasure]);

  /**
   * Make sure an analyzer exists with the correct mode
   */
  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (analyzerRef.current) {
      analyzerRef.current.mode = octaveBands;
      return;
    }

    analyzerRef.current = new FFTAnalyzer(audioRef.current);
    analyzerRef.current.mode = octaveBands;
    setDirtyFlip(!dirtyFlip);
  }, [octaveBands]);

  return dirtyFlip;
}

const AudioAnalyzerMicrophone = ({ ...props }): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<FFTAnalyzer>(null!);
  const dirtyFlip = useAnalyzerControls({ audioRef, analyzerRef });
  return (
    <>
      <audio ref={audioRef} />
      <MicrophoneSourceControls
        audioRef={audioRef}
        analyzerRef={analyzerRef}
        dirtyFlip={dirtyFlip}
        {...props}
      />
    </>
  );
};

const AudioAnalyzerFileUpload = ({ ...props }): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<FFTAnalyzer>(null!);
  const dirtyFlip = useAnalyzerControls({ audioRef, analyzerRef });

  return (
    <>
      <audio ref={audioRef} />
      <FileSourceControls
        audioRef={audioRef}
        analyzerRef={analyzerRef}
        dirtyFlip={dirtyFlip}
        {...props}
      />
    </>
  );
};

const AudioAnalyzerLivestream = ({ ...props }): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<FFTAnalyzer>(null!);
  const dirtyFlip = useAnalyzerControls({ audioRef, analyzerRef });

  return (
    <>
      <audio ref={audioRef} crossOrigin="anonymous" />
      <LivestreamSourceControls
        audioRef={audioRef}
        analyzerRef={analyzerRef}
        dirtyFlip={dirtyFlip}
        {...props}
      />
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

  switch (audioSource as unknown as AudioSource) {
    case AUDIO_SOURCE.LIVE_STREAM:
      return (
        <>
          <AudioSourceComponent
            audioSource={audioSource as unknown as AudioSource}
          />
          ;{/* <AudioAnalyzerLivestream />; */}
        </>
      );
    case AUDIO_SOURCE.MICROPHONE:
      return (
        <>
          <AudioSourceComponent
            audioSource={audioSource as unknown as AudioSource}
          />
          ;{/* <AudioAnalyzerMicrophone />; */}
        </>
      );
    case AUDIO_SOURCE.FILE_UPLOAD:
      return (
        <>
          <AudioSourceComponent
            audioSource={audioSource as unknown as AudioSource}
          />
          ;{/* <AudioAnalyzerFileUpload />; */}
        </>
      );
    default:
      throw new Error(`Unsupported source: ${audioSource}`);
  }
};

export default AudioAnalyzer;
