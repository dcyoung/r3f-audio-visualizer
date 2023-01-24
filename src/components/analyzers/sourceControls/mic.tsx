import { useEffect, useRef } from "react";
import { AnalyzerSourceControlsProps } from "./common";

const MicrophoneSourceControls = ({
  audioRef,
  analyzerRef,
  dirtyFlip = false,
}: AnalyzerSourceControlsProps): JSX.Element => {
  const micStream = useRef<null | MediaStreamAudioSourceNode>(null!);
  const disableMic = () => {
    console.log("Disabling mic...");
    analyzerRef.current.disconnectInputs();
    if (micStream?.current) {
      micStream.current = null;
    }
  };

  const enableMic = () => {
    console.log("Enabling mic...");
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

  /**
   * Make sure the microphone is enabled
   */
  useEffect(() => {
    console.log("Called a");
    if (!audioRef.current) {
      return;
    }

    console.log("Called b");

    if (!analyzerRef.current) {
      return;
    }
    console.log("Called c");
    analyzerRef.current.volume = 0;
    enableMic();
  }, [audioRef, analyzerRef, dirtyFlip]);

  return <></>;
};

export default MicrophoneSourceControls;
