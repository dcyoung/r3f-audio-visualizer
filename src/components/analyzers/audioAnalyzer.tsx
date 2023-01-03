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
  return mode === APPLICATION_MODE.LIVE_STREAM ? (
    <LivestreamAnalyzer {...props} />
  ) : (
    <MicAnalyzer {...props} />
  );
};

export default AudioAnalyzer;
