import { folder, useControls } from "leva";
import { useEffect } from "react";
import { audioFileInput } from "../../levaPlugins/audioFileInput";
import { AudioSourceControlsProps } from "./common";

const FileAudioControls = ({
  audio,
}: AudioSourceControlsProps): JSX.Element => {
  const { audioFile } = useControls({
    Audio: folder({
      audioFile: audioFileInput({ file: undefined }),
    }),
  });

  /**
   * Make sure the correct file is playing
   */
  useEffect(() => {
    audio.pause();

    if (!audioFile) {
      return;
    }
    audio.src = URL.createObjectURL(audioFile);
    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => console.log(`Playing ${audioFile.name}`))
        .catch((error) => {
          // Auto-play was prevented
          console.error(`Error playing ${audioFile}`);
        });
    }
    return () => {
      audio.pause();
    };
  }, [audio, audioFile]);
  return <></>;
};

export default FileAudioControls;
