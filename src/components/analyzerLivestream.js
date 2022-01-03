import { useEffect, useRef } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { folder, useControls } from "leva";

function AnaylzerLivestream({ freqDataRef }) {
  const audioRef = useRef();
  const analyzerRef = useRef();

  const playAudio = () => {
    audioRef.current.src = "https://icecast2.ufpel.edu.br/live";
    audioRef.current.play();
  };

  const pauseAudio = () => {
    audioRef.current.pause();
  };

  useControls({
    Audio: folder({
      audioEnabled: {
        value: true,
        // imperatively update the world after Leva input changes
        onChange: (v) => {
          v ? playAudio() : pauseAudio();
        },
      },
      render: (get) => get("mode") === "livestream",
    }),
  });

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
  }, []);

  return <audio ref={audioRef} crossOrigin="anonymous" />;
}

export default AnaylzerLivestream;
