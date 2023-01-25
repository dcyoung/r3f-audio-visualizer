import { useEffect, useRef } from "react";
import { useAudioContext } from "../../appState";
import { AudioSourceControlsProps } from "./common";

const MicrophoneSourceControls = ({
  audioRef,
}: AudioSourceControlsProps): JSX.Element => {
  const audioContext = useAudioContext();
  const micStream = useRef<null | MediaStreamAudioSourceNode>(null!);
  const disableMic = () => {
    console.log("Disabling mic...");
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
          micStream.current = audioContext.createMediaStreamSource(stream);
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
    enableMic();
  }, [audioRef, audioContext]);

  return <></>;
};

export default MicrophoneSourceControls;
