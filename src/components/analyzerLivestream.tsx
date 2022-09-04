import { useEffect, useRef, MutableRefObject } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";

interface AnaylzerLivestreamProps {
  freqDataRef: MutableRefObject<any>,
  url?: string,
}

const AnaylzerLivestream = ({
  freqDataRef,
  url = "https://icecast2.ufpel.edu.br/live"
}: AnaylzerLivestreamProps): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<AudioMotionAnalyzer>(null!);

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
    if (!freqDataRef.current || freqDataRef.current === undefined) {
      freqDataRef.current = new Array(bars.length);
    }

    bars.forEach(({ value }, index) => {
      freqDataRef.current[index] = value[0];
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
}

export default AnaylzerLivestream;
