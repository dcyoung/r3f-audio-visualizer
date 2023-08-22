import { folder, useControls } from "leva";

import BaseScopeVisual, { type TextureMapper } from "./base";

const ScopeVisual = ({ textureMapper }: { textureMapper: TextureMapper }) => {
  const { usePoints, color } = useControls({
    "Visual - Scope": folder(
      {
        usePoints: true,
        color: { r: 0, b: 0, g: 255, a: 1 },
      },
      { collapsed: true }
    ),
  });
  return (
    <BaseScopeVisual
      textureMapper={textureMapper}
      usePoints={usePoints}
      interpolate={false}
      color={color}
    />
  );
};

export default ScopeVisual;
