import { type VisualProps } from "@/components/visualizers/common";

import Horse from "./horse";
import { Treadmill } from "./treadmill";

export default ({ ...props }: VisualProps) => {
  return (
    <>
      <Treadmill {...props} />
      <Horse {...props} />
    </>
  );
};
