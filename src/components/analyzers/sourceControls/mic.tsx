import { folder, useControls } from "leva";
import { useEffect, useRef } from "react";
import { AnalyzerSourceControlsProps } from "./common";

const MicrophoneSourceControls = ({
  audioRef,
  analyzerRef,
}: AnalyzerSourceControlsProps): JSX.Element => {
  const micStream = useRef<null | MediaStreamAudioSourceNode>(null!);
  const { micEnabled } = useControls({
    Audio: folder({
      micEnabled: false,
    }),
  });
  const disableMic = () => {
    analyzerRef.current.disconnectInputs();
    if (micStream?.current) {
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

  /**
   * Make sure the microphone is enabled
   */
  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (!analyzerRef.current) {
      return;
    }
    analyzerRef.current.volume = 0;

    if (micEnabled) {
      enableMic();
    } else {
      disableMic();
    }
  }, [analyzerRef, micEnabled]);

  return <></>;
};

export default MicrophoneSourceControls;
