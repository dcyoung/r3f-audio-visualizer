import { useEffect, useRef } from "react";

import { type AudioSourceControlsProps } from "@/components/audio/sourceControls/common";

export interface ScreenShareControlsProps extends AudioSourceControlsProps {
  onDisabled: () => void;
  onStreamCreated: (stream: MediaStream) => void;
}
const ScreenShareControls = ({
  audio,
  onDisabled,
  onStreamCreated,
}: ScreenShareControlsProps) => {
  const mediaStream = useRef<null | MediaStreamAudioSourceNode>(null);

  /**
   * Make sure the share is enabled
   */
  useEffect(() => {
    console.log("Disabling share...");
    onDisabled();
    if (mediaStream?.current) {
      mediaStream.current = null;
    }

    console.log("Enabling share...");
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
          alert("Share access denied by user");
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

export default ScreenShareControls;
