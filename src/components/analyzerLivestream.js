import { useEffect, useRef, useState } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";

function AnaylzerLivestream({ freqDataRef }) {
  const audioRef = useRef();
  const analyzerRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    audioRef.current.src = "https://icecast2.ufpel.edu.br/live";
    audioRef.current.play();
    analyzerRef.current.volume = 1.0;
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const updateFreqData = (instance) => {
    if (!freqDataRef.current) {
      freqDataRef.current = new Array(instance.getBars().length);
    }
    let barIdx = 0;
    for (const bar of instance.getBars()) {
      freqDataRef.current[barIdx] = bar.value[0];
      barIdx++;
    }
  };

  useEffect(() => {
    analyzerRef.current = new AudioMotionAnalyzer(null, {
      source: audioRef.current,
      mode: 2,
      useCanvas: false, // don't use the canvas
      onCanvasDraw: updateFreqData,
    });
    analyzerRef.current.volume = 1;
    playAudio();
  }, []);

  return (
    <div>
      <audio ref={audioRef} crossOrigin="anonymous" />
      <button onClick={togglePlay} className="block">
        {isPlaying ? "Pause" : "Play"}
      </button>{" "}
    </div>
  );
}

export default AnaylzerLivestream;
