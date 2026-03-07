import { type TVisualProps } from "../models";
import BaseScopeVisual from "./base";

export default ({ textureMapper }: TVisualProps) => {
  return (
    <BaseScopeVisual
      textureMapper={textureMapper}
      usePoints={true}
      interpolate={false}
    />
  );
};
