import { useEffect, useRef } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { folder, useControls } from "leva";

function AnalyzerMic({ freqDataRef }) {
  const audioRef = useRef();
  const analyzerRef = useRef();
  const micStream = useRef();

  const disableMic = () => {
    if (micStream?.current) {
      analyzerRef.current.disconnectInput(micStream.current);
      micStream.current = null;
    }
  };
  const enableMic = () => {
    disableMic();
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          audioRef.current.pause();
          // create stream using audioMotion audio context
          micStream.current =
            analyzerRef.current.audioCtx.createMediaStreamSource(stream);
          // connect microphone stream to analyzer
          analyzerRef.current.connectInput(micStream.current);
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

  useControls({
    "🎤 Microphone": folder({
      micEnabled: {
        value: true,
        // imperatively update the world after Leva input changes
        onChange: (v) => {
          v ? enableMic() : disableMic();
        },
      },
      render: (get) => get("mode") === "mic",
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
    analyzerRef.current.volume = 0;
  }, []);

  return <audio ref={audioRef} crossOrigin="anonymous" />;
}

export default AnalyzerMic;
