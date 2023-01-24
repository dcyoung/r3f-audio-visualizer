import { folder, useControls } from "leva";
import { useEffect, useRef } from "react";
import { useAppStateActions, useEnergyInfo, useFreqData } from "../appState";
import FFTAnalyzer, { EnergyMeasure } from "./fft";
import {
  AnalyzerSourceControlsProps,
  AudioAnalyzerSource,
  AUDIO_ANALYZER_SOURCE,
} from "./sourceControls/common";
import LivestreamSourceControls from "./sourceControls/livestream";
import MicrophoneSourceControls from "./sourceControls/mic";

function useAnalyzerControls({
  audioRef,
  analyzerRef,
}: AnalyzerSourceControlsProps) {
  // const audioRef = useRef<HTMLAudioElement>(null!);
  // const analyzerRef = useRef<FFTAnalyzer>(null!);
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
  const freqData = useFreqData();
  const energyInfo = useEnergyInfo();
  const { resizeFreqData } = useAppStateActions();
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
      resizeFreqData(bars.length);
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
  }, [octaveBands]);

  // useEffect(() => {
  //   analyzerRef.current = new FFTAnalyzer(audioRef.current);
  //   analyzerRef.current.mode = octaveBands;
  // }, [audioSource]);

  // return [audioRef, analyzerRef] as const;
}

const AudioAnalyzerMicrophone = ({ ...props }): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<FFTAnalyzer>(null!);
  useAnalyzerControls({ audioRef, analyzerRef });
  return (
    <>
      <audio ref={audioRef} crossOrigin="anonymous" />
      <MicrophoneSourceControls
        audioRef={audioRef}
        analyzerRef={analyzerRef}
        {...props}
      />
    </>
  );
};

const AudioAnalyzerLivestream = ({ ...props }): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<FFTAnalyzer>(null!);
  useAnalyzerControls({ audioRef, analyzerRef });

  return (
    <>
      <audio ref={audioRef} crossOrigin="anonymous" />
      <LivestreamSourceControls
        audioRef={audioRef}
        analyzerRef={analyzerRef}
        {...props}
      />
    </>
  );
};

export interface AudioAnalyzerProps {
  audioSource?: AudioAnalyzerSource;
}
const AudioAnalyzer = ({
  audioSource = AUDIO_ANALYZER_SOURCE.LIVE_STREAM,
  ...props
}: AudioAnalyzerProps): JSX.Element => {
  switch (audioSource) {
    case AUDIO_ANALYZER_SOURCE.LIVE_STREAM:
      return <AudioAnalyzerLivestream {...props} />;
    case AUDIO_ANALYZER_SOURCE.MICROPHONE:
      return <AudioAnalyzerMicrophone {...props} />;
    default:
      throw new Error(`Unsupported source: ${audioSource}`);
  }
};

export default AudioAnalyzer;
