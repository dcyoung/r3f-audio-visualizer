import { useEffect, useRef, MutableRefObject } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";

interface AnaylzerMicProps {
  freqDataRef: MutableRefObject<any>
}
const AnalyzerMic = ({
  freqDataRef
}: AnaylzerMicProps): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<AudioMotionAnalyzer>(null!);
  const micStream = useRef<null | MediaStreamAudioSourceNode>(null!);

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
          // Disable any audio
          if (audioRef.current) {
            audioRef.current.pause();
          }
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

  const updateFreqData = (instance: AudioMotionAnalyzer): void => {
    if (!freqDataRef.current || freqDataRef.current === undefined) {
      freqDataRef.current = new Array(instance.getBars().length);
    }
    let barIdx = 0;
    for (const bar of instance.getBars()) {
      freqDataRef.current[barIdx] = bar.value[0];
      barIdx++;
    }
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
    analyzerRef.current.volume = 0;
    enableMic();
  }, []);

  return <audio ref={audioRef} crossOrigin="anonymous" />;
}

export default AnalyzerMic;
