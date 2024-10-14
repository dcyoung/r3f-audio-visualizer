import { type TVisualProps } from "@/components/visualizers/models";

import BaseRibbons from "./base";

export default ({ coordinateMapper }: TVisualProps) => {
  return (
    <>
      <BaseRibbons coordinateMapper={coordinateMapper} />
    </>
  );
};
