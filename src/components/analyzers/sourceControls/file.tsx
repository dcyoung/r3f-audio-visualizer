import { folder, useControls } from "leva";
import { useEffect } from "react";
import { audioFileInput } from "../../levaPlugins/audioFileInput";
import { AnalyzerSourceControlsProps } from "./common";

const FileSourceControls = ({
  audioRef,
  analyzerRef,
  dirtyFlip = false,
}: AnalyzerSourceControlsProps): JSX.Element => {
  const { audioFile } = useControls({
    Audio: folder({
      audioFile: audioFileInput({ file: undefined }),
    }),
  });

  /**
   * Make sure the volume is up
   */
  useEffect(() => {
    if (analyzerRef.current) {
      analyzerRef.current.volume = 1.0;
    }
  }, [analyzerRef]);

  /**
   * Make sure the correct stream is playing
   */
  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.pause();

    if (!audioFile) {
      return;
    }
    audioRef.current.src = URL.createObjectURL(audioFile);
    const promise = audioRef.current.play();
    if (promise !== undefined) {
      promise
        .then(() => console.log(`Playing ${audioFile.name}`))
        .catch((error) => {
          // Auto-play was prevented
          console.error(`Error playing ${audioFile}`);
        });
    }
  }, [audioRef, audioFile, dirtyFlip]);

  return <></>;
};

export default FileSourceControls;
