import { folder, useControls } from "leva";
import { useEffect, useState } from "react";
import { audioFileInput } from "../../levaPlugins/audioFileInput";
import { AudioSourceControlsProps, iOS } from "./common";
import "./overlay.css";
const FileAudioControls = ({
  audio,
}: AudioSourceControlsProps): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (!iOS()) {
      // Can play immediately on non-ios platforms
      const promise = audio.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            setIsPlaying(true);
            console.log(`Playing ${audioFile.name}`);
          })
          .catch((error) => {
            // Auto-play was prevented
            console.error(`Error playing ${audioFile}`, error);
          });
      }
    }
    return () => {
      audio.pause();
      setIsPlaying(false);
    };
  }, [audio, audioFile]);

  // IOS needs a dedicated play button
  return iOS() ? (
    <div
      id="info"
      style={{ bottom: "0.5em", right: "0.5em" }}
      hidden={!audioFile || isPlaying}
    >
      <button
        disabled={!audioFile || isPlaying}
        onClick={() => {
          if (!audioFile) {
            return;
          }
          const promise = audio.play();
          if (promise !== undefined) {
            promise
              .then(() => {
                setIsPlaying(true);
                console.log(`Playing ${audioFile.name}`);
              })
              .catch((error) => {
                // Auto-play was prevented
                console.error(`Error playing ${audioFile}`, error);
              });
          }
        }}
      >
        Play
      </button>
    </div>
  ) : (
    <></>
  );
};

export default FileAudioControls;
