import { type VisualProps } from "@/components/visualizers/models";

import BaseRibbons from "./base";

export default ({ coordinateMapper }: VisualProps) => {
  return (
    <>
      <BaseRibbons coordinateMapper={coordinateMapper} />
    </>
  );
};
