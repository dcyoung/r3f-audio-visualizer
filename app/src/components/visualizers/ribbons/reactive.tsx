import { type VisualProps } from "@/components/visualizers/common";

import BaseRibbons from "./base";

const RibbonsVisual = ({ coordinateMapper }: VisualProps) => {
  // const {} = useRibbonsVisualConfigContext();
  return (
    <>
      <BaseRibbons coordinateMapper={coordinateMapper} />
    </>
  );
};

export default RibbonsVisual;
