import { useRef } from "react";
import { AudioSource, AUDIO_SOURCE } from "./sourceControls/common";
import FileSourceControls from "./sourceControls/file";
import LivestreamSourceControls from "./sourceControls/livestream";
import MicrophoneSourceControls from "./sourceControls/mic";

export interface AudioSourceComponentProps {
  audioSource: AudioSource;
}
const AudioSourceComponent = ({
  audioSource,
}: AudioSourceComponentProps): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null!);
  switch (audioSource) {
    case AUDIO_SOURCE.LIVE_STREAM:
      return (
        <>
          <audio ref={audioRef} crossOrigin="anonymous" />;
          <LivestreamSourceControls audioRef={audioRef} />;
        </>
      );
    case AUDIO_SOURCE.MICROPHONE:
      return (
        <>
          <audio ref={audioRef} />
          <MicrophoneSourceControls audioRef={audioRef} />
        </>
      );
    case AUDIO_SOURCE.FILE_UPLOAD:
      return (
        <>
          <audio ref={audioRef} />;
          <FileSourceControls audioRef={audioRef} />;
        </>
      );
  }
};

export default AudioSourceComponent;
