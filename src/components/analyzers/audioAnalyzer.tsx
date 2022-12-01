import { EApplicationMode } from "../applicationModes";
import LivestreamAnalyzer from "./source/livestream";
import MicAnalyzer from "./source/mic";

interface AudioAnalyzerProps {
  mode?: EApplicationMode;
}

const AudioAnalyzer = ({
  mode = EApplicationMode.LIVE_STREAM,
  ...props
}: AudioAnalyzerProps): JSX.Element => {
  return mode === EApplicationMode.LIVE_STREAM ? (
    <LivestreamAnalyzer {...props} />
  ) : (
    <MicAnalyzer {...props} />
  );
};

export default AudioAnalyzer;
