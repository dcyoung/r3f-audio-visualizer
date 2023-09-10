import { AUDIO_SOURCE } from "@/components/audio/sourceControls/common";
import FileAudioControls from "@/components/audio/sourceControls/file";
import { CurrentTrackPlayer } from "@/components/controls/soundcloud/player";

const ControlledAudioSource = ({
  audio,
  audioSource,
}: {
  audio: HTMLAudioElement;
  audioSource: "LIVE_STREAM" | "FILE_UPLOAD";
}) => {
  switch (audioSource) {
    case AUDIO_SOURCE.LIVE_STREAM:
      return <CurrentTrackPlayer audio={audio} />;
    case AUDIO_SOURCE.FILE_UPLOAD:
      return <FileAudioControls audio={audio} />;
    default:
      return audioSource satisfies never;
  }
};
export default ControlledAudioSource;
