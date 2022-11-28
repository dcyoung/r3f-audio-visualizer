import { useEffect, useRef } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { useAppState } from "../../appState";

interface LivestreamAnalyzerProps {
  url?: string;
}

const LivestreamAnalyzer = ({
  // url = "https://icecast2.ufpel.edu.br/live" // dead
  url = "http://igor.torontocast.com:1950/stream",
}: LivestreamAnalyzerProps): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<AudioMotionAnalyzer>(null!);
  const freqData = useAppState((state) => state.data);
  const resizeFreqData = useAppState((state) => state.resizeData);

  const playAudio = () => {
    console.log("Play Audio...");
    audioRef.current!.src = url;
    audioRef.current!.play();
  };

  const pauseAudio = () => {
    audioRef.current!.pause();
  };

  const updateFreqData = (instance: AudioMotionAnalyzer): void => {
    const bars = instance.getBars();

    if (freqData.length != bars.length) {
      resizeFreqData(bars.length);
      console.log(`Resizing ${bars.length}`);
    }

    bars.forEach(({ value }, index) => {
      freqData[index] = value[0];
    });
  };

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (analyzerRef.current) {
      return;
    }

    analyzerRef.current = new AudioMotionAnalyzer(undefined, {
      source: audioRef.current,
      mode: 2,
      useCanvas: false, // don't use the canvas
      onCanvasDraw: updateFreqData,
    });
    analyzerRef.current.volume = 1;
    playAudio();
  }, []);

  return <audio ref={audioRef} crossOrigin="anonymous" />;
};

export default LivestreamAnalyzer;
