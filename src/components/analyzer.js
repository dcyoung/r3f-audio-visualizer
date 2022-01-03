import { useEffect, useRef } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";

function Analyzer({ freqDataRef }) {
  const audioRef = useRef();
  const analyzerRef = useRef();

  const playAudio = () => {
    audioRef.current.src = "https://icecast2.ufpel.edu.br/live";
    audioRef.current.play();
  };

  const pauseAudio = () => {
    audioRef.current.pause();
  };

  const toggleMic = () => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          audioRef.current.pause();
          // create stream using audioMotion audio context
          const micStream =
            analyzerRef.current.audioCtx.createMediaStreamSource(stream);
          // connect microphone stream to analyzer
          analyzerRef.current.connectInput(micStream);
          // mute output to prevent feedback loops from the speakers
          analyzerRef.current.volume = 0;
        })
        .catch((err) => {
          alert("Microphone access denied by user");
        });
    } else {
      alert("User mediaDevices not available");
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
  });
  return (
    <div>
      <audio ref={audioRef} crossOrigin="anonymous" />
      <span>CONTROLS----------</span>
      <button onClick={() => playAudio()}>Play</button>
      <button onClick={() => pauseAudio()}>Pause</button>
      <button onClick={() => toggleMic()}>Mic</button>
    </div>
  );
}

export default Analyzer;
