import React, { Suspense } from "react";
import { MutableRefObject } from "react";
import {
  APPLICATION_MODE_LIVE_STREAM,
  APPLICATION_MODE_MICROPHONE,
} from "./application_modes";

const getImportName = (mode: string): string => {
  switch (mode) {
    case APPLICATION_MODE_LIVE_STREAM:
      return "analyzerLivestream";
    case APPLICATION_MODE_MICROPHONE:
      return "analyzerMic";
    default:
      throw Error(`Unsupported application mode: ${mode}`);
  }
};

interface AudioAnaylzerProps {
  freqDataRef: MutableRefObject<any>;
  mode?: string;
}

const AudioAnaylzer = ({
  freqDataRef,
  mode = APPLICATION_MODE_LIVE_STREAM,
  ...props
}: AudioAnaylzerProps): JSX.Element => {
  const AnalyzerComponent = React.lazy(
    () => import(`./analyzers/${getImportName(mode)}.tsx`)
  );
  return (
    <Suspense fallback={null}>
      <AnalyzerComponent freqDataRef={freqDataRef} {...props} />
    </Suspense>
  );
};

export default AudioAnaylzer;
