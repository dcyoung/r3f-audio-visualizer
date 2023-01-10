import { useEffect, useRef } from "react";
import { useAppState } from "../../appState";
import FFTAnalyzer from "../fft";

interface MicAnalyzerProps {
  analyzerMode?: number;
}

const MicAnalyzer = ({ analyzerMode = 2 }: MicAnalyzerProps): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<FFTAnalyzer>(null!);
  const micStream = useRef<null | MediaStreamAudioSourceNode>(null!);
  const freqData = useAppState((state) => state.data);
  const resizeFreqData = useAppState((state) => state.resizeData);
  const requestRef = useRef<number>(null!);

  const disableMic = () => {
    if (micStream?.current) {
      analyzerRef.current.disconnectInputs();
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
            analyzerRef.current._audioCtx.createMediaStreamSource(stream);
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
      freqData[index] = value;
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

    analyzerRef.current = new FFTAnalyzer(audioRef.current);
    analyzerRef.current.volume = 0;
    enableMic();
  }, [analyzerMode]);

  return <audio ref={audioRef} crossOrigin="anonymous" />;
};

export default MicAnalyzer;
