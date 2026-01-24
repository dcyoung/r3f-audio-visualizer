import { type ComponentPropsWithoutRef } from "react";
import {
  type TOmitVisualProps,
  type TVisualProps,
} from "@/components/visualizers/models";
import { createConfigStore } from "@/lib/storeHelpers";

import BaseVisual from "./base";
import Ground from "./ground";

export type TConfig = Required<
  TOmitVisualProps<ComponentPropsWithoutRef<typeof BaseVisual>>
>;

export const { useParams, useActions, usePresets } = createConfigStore<TConfig>(
  {
    default: {},
  },
);

export default ({ coordinateMapper }: TVisualProps) => {
  const params = useParams();

  return (
    <>
      <BaseVisual coordinateMapper={coordinateMapper} {...params} />
      <Ground position={[0, 0, -2]} />
    </>
  );
};
