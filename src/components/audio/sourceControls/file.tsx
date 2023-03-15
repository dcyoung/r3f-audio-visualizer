import { folder, useControls } from "leva";
import { useEffect, useRef, useState } from "react";
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

  const playAudio = () => {
    if (!audioFile) {
      return;
    }
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
  };

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
      playAudio();
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
      style={{
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        msTransform: "translateX(-50%) translateY(-50%)",
      }}
      hidden={!audioFile || isPlaying}
    >
      <button disabled={!audioFile || isPlaying} onClick={playAudio}>
        Play
      </button>
    </div>
  ) : (
    <></>
  );
};

export default FileAudioControls;
