import React, { Suspense } from "react";
import { MutableRefObject } from "react";

interface AudioAnaylzerProps {
  freqDataRef: MutableRefObject<any>;
  mic?: boolean;
}

const AudioAnaylzer = ({
  freqDataRef,
  mic = true,
  ...props
}: AudioAnaylzerProps): JSX.Element => {
  const AnalyzerComponent = React.lazy(
    () =>
      import(`./analyzers/${mic ? "analyzerMic" : "analyzerLivestream"}.tsx`)
  );
  return (
    <Suspense fallback={null}>
      <AnalyzerComponent freqDataRef={freqDataRef} {...props} />
    </Suspense>
  );
};

export default AudioAnaylzer;
