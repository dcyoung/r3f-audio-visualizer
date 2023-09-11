import { type PropsWithChildren } from "react";

import { CubeVisualConfigContextProvider } from "./cube";
import { RingVisualConfigContextProvider } from "./diffusedRing";
import { DnaVisualConfigContextProvider } from "./dna";
import { GridVisualConfigContextProvider } from "./grid";
import { PinGridVisualConfigContextProvider } from "./pinGrid";
import { SphereVisualConfigContextProvider } from "./sphere";
import { StencilVisualConfigContextProvider } from "./stencil";
import { SwarmVisualConfigContextProvider } from "./swarm";

export const CombinedVisualsConfigContextProvider = ({
  children,
}: PropsWithChildren) => {
  return (
    <CubeVisualConfigContextProvider>
      <GridVisualConfigContextProvider>
        <RingVisualConfigContextProvider>
          <DnaVisualConfigContextProvider>
            <SwarmVisualConfigContextProvider>
              <PinGridVisualConfigContextProvider>
                <SphereVisualConfigContextProvider>
                  <StencilVisualConfigContextProvider>
                    {children}
                  </StencilVisualConfigContextProvider>
                </SphereVisualConfigContextProvider>
              </PinGridVisualConfigContextProvider>
            </SwarmVisualConfigContextProvider>
          </DnaVisualConfigContextProvider>
        </RingVisualConfigContextProvider>
      </GridVisualConfigContextProvider>
    </CubeVisualConfigContextProvider>
  );
};
