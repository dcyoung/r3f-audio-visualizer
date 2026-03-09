import { useParams } from "../audioScope/reactive";
import { type TVisualProps } from "../models";
import BaseScopeTSLVisual from "./base";

export default ({ textureMapper }: TVisualProps) => {
  const params = useParams();
  return <BaseScopeTSLVisual textureMapper={textureMapper} {...params} />;
};
