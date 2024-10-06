import { type VisualProps } from "@/components/visualizers/common";

import Horse from "./horse";
import { Treadmill } from "./treadmill";

const TreadmillVisual = ({ ...props }: VisualProps) => {
  return (
    <>
      <Treadmill {...props} />
      <Horse {...props} />
    </>
  );
};

export default TreadmillVisual;
