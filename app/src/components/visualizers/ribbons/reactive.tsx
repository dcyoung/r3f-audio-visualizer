import { type VisualProps } from "@/components/visualizers/common";

import BaseRibbons from "./base";

export default ({ coordinateMapper }: VisualProps) => {
  return (
    <>
      <BaseRibbons coordinateMapper={coordinateMapper} />
    </>
  );
};
