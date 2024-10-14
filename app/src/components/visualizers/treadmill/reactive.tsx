import { type TVisualProps } from "@/components/visualizers/models";

import Horse from "./horse";
import { Treadmill } from "./treadmill";

export default ({ ...props }: TVisualProps) => {
  return (
    <>
      <Treadmill {...props} />
      <Horse {...props} />
    </>
  );
};
