import React, { Suspense } from "react";

interface ReactiveVisualProps {
  visual: string;
  useData: boolean;
}

const ReactiveVisual = ({
  visual,
  useData,
  ...props
}: ReactiveVisualProps): JSX.Element => {
  const VisualComponent = React.lazy(
    () => import(`./visualizers/${useData ? "data" : "waveform"}/${visual}.tsx`)
  );

  return (
    <Suspense fallback={null}>
      <VisualComponent {...props} />
    </Suspense>
  );
};

export default ReactiveVisual;
