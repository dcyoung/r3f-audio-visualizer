import { useControls } from "leva";
import { ApplicationMode, APPLICATION_MODE } from "../applicationModes";
import LivestreamAnalyzer from "./source/livestream";
import MicAnalyzer from "./source/mic";

interface AudioAnalyzerProps {
  mode?: ApplicationMode;
}

const AudioAnalyzer = ({
  mode = APPLICATION_MODE.LIVE_STREAM,
  ...props
}: AudioAnalyzerProps): JSX.Element => {
  const { octaveBands } = useControls({
    octaveBands: {
      value: 2,
      options: {
        "1/24th octave bands": 1,
        "1/12th octave bands": 2,
        "1/8th octave bands": 3,
        "1/6th octave bands": 4,
        "1/4th octave bands": 5,
        "1/3rd octave bands": 6,
        "Half octave bands": 7,
        "Full octave bands": 8,
      },
    },
  });
  return mode === APPLICATION_MODE.LIVE_STREAM ? (
    <LivestreamAnalyzer analyzerMode={octaveBands} {...props} />
  ) : (
    <MicAnalyzer analyzerMode={octaveBands} {...props} />
  );
};

export default AudioAnalyzer;
