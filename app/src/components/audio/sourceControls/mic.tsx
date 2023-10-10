import { useEffect, useRef } from "react";

import { type AudioSourceControlsProps } from "@/components/audio/sourceControls/common";

export interface MicrophoneAudioControlsProps extends AudioSourceControlsProps {
  onDisabled: () => void;
  onStreamCreated: (stream: MediaStream) => void;
}
const MicrophoneAudioControls = ({
  audio,
  onDisabled,
  onStreamCreated,
}: MicrophoneAudioControlsProps) => {
  const mediaStream = useRef<null | MediaStreamAudioSourceNode>(null);

  /**
   * Make sure the microphone is enabled
   */
  useEffect(() => {
    console.log("Disabling mic...");
    onDisabled();
    if (mediaStream?.current) {
      mediaStream.current = null;
    }

    console.log("Enabling mic...");
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: false,
        })
        .then(onStreamCreated)
        .catch((err) => {
          console.error(err);
          alert("Microphone access denied by user");
        });
    } else {
      alert("User mediaDevices not available");
    }

    return () => {
      audio.pause();
      if (mediaStream?.current) {
        mediaStream.current = null;
      }
    };
  }, [audio, onDisabled, onStreamCreated]);

  return <></>;
};

export default MicrophoneAudioControls;
