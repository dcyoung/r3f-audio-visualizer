import { useEffect, useRef } from "react";

import { type AudioSourceControlsProps } from "./common";

export interface ScreenShareControlsProps extends AudioSourceControlsProps {
  onDisabled: () => void;
  onStreamCreated: (stream: MediaStream) => void;
}
const ScreenShareControls = ({
  audio,
  onDisabled,
  onStreamCreated,
}: ScreenShareControlsProps) => {
  const micStream = useRef<null | MediaStreamAudioSourceNode>(null);

  /**
   * Make sure the microphone is enabled
   */
  useEffect(() => {
    console.log("Disabling mic...");
    onDisabled();
    if (micStream?.current) {
      micStream.current = null;
    }

    console.log("Enabling mic...");
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getDisplayMedia({
          video: {
            displaySurface: "browser",
            // logicalSurface: "exact",
            width: 1,
          },
          audio: true,
          // selfBrowserSurface: "exclude",
          // surfaceSwitching: "exclude",
          // systemAudio: "include",
        })
        .then((media) => {
          console.log(media.getAudioTracks());
          onStreamCreated(media);
        })
        .catch((err) => {
          console.error(err);
          alert("Microphone access denied by user");
        });
    } else {
      alert("User mediaDevices not available");
    }

    return () => {
      audio.pause();
      if (micStream?.current) {
        micStream.current = null;
      }
    };
  }, [audio, onDisabled, onStreamCreated]);

  return <></>;
};

export default ScreenShareControls;
