import React, { Suspense } from "react";
import {
  APPLICATION_MODE_LIVE_STREAM,
  APPLICATION_MODE_MICROPHONE,
} from "../applicationModes";

const getImportName = (mode: string): string => {
  switch (mode) {
    case APPLICATION_MODE_LIVE_STREAM:
      return "livestream";
    case APPLICATION_MODE_MICROPHONE:
      return "mic";
    default:
      throw Error(`Unsupported application mode: ${mode}`);
  }
};

interface AudioAnalyzerProps {
  mode?: string;
}

const AudioAnalyzer = ({
  mode = APPLICATION_MODE_LIVE_STREAM,
  ...props
}: AudioAnalyzerProps): JSX.Element => {
  const AnalyzerComponent = React.lazy(
    () => import(`./source/${getImportName(mode)}.tsx`)
  );
  return (
    <>
      <Suspense fallback={null}>
        <AnalyzerComponent {...props} />
      </Suspense>
    </>
  );
};

export default AudioAnalyzer;
