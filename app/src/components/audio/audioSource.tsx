import { AUDIO_SOURCE } from "./sourceControls/common";
import FileAudioControls from "./sourceControls/file";
import LivestreamAudioControls from "./sourceControls/livestream";

const ControlledAudioSource = ({
  audio,
  audioSource,
}: {
  audio: HTMLAudioElement;
  audioSource: "LIVE_STREAM" | "FILE_UPLOAD";
}) => {
  switch (audioSource) {
    case AUDIO_SOURCE.LIVE_STREAM:
      return <LivestreamAudioControls audio={audio} />;
    case AUDIO_SOURCE.FILE_UPLOAD:
      return <FileAudioControls audio={audio} />;
    default:
      return audioSource satisfies never;
  }
};
export default ControlledAudioSource;
