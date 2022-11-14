import React, { MutableRefObject, Suspense } from "react";

interface ReactiveVisualProps {
  visual: string;
  amplitude?: number;
  dataRef?: MutableRefObject<number[]> | null;
}

const ReactiveVisual = ({
  visual,
  amplitude = 1.0,
  dataRef = null,
  ...props
}: ReactiveVisualProps): JSX.Element => {
  const VisualComponent = React.lazy(
    () => import(`./visualizers/${dataRef ? "data" : "waveform"}/${visual}.tsx`)
  );

  return (
    <Suspense fallback={null}>
      {dataRef ? (
        <VisualComponent dataRef={dataRef} amplitude={amplitude} {...props} />
      ) : (
        <VisualComponent amplitude={amplitude} {...props} />
      )}
    </Suspense>
  );
};

export default ReactiveVisual;
