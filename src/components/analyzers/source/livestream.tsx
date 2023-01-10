import { useEffect, useRef } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { useAppState } from "../../appState";

interface LivestreamAnalyzerProps {
  url?: string;
  analyzerMode?: number;
}

const LivestreamAnalyzer = ({
  // url = "https://icecast2.ufpel.edu.br/live" // dead
  url = "http://igor.torontocast.com:1950/stream",
  analyzerMode = 2,
}: LivestreamAnalyzerProps): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<AudioMotionAnalyzer>(null!);
  const freqData = useAppState((state) => state.data);
  const resizeFreqData = useAppState((state) => state.resizeData);
  const requestRef = useRef<number>(null!);

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

    bars.forEach(({ value }, index) => {
      freqData[index] = value[0];
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [freqData]); // Make sure the effect runs only once

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (analyzerRef.current) {
      analyzerRef.current.mode = analyzerMode;
      return;
    }

    analyzerRef.current = new AudioMotionAnalyzer(undefined, {
      source: audioRef.current,
      useCanvas: false,
      stereo: false,
      mode: analyzerMode,
      volume: 1.0,
    });
    audioRef.current.src = url;
    audioRef.current.play();
  }, [analyzerMode]);

  return <audio ref={audioRef} crossOrigin="anonymous" />;
};

export default LivestreamAnalyzer;
