import { Stats } from "@react-three/drei";
import { parseAsBoolean, useQueryState } from "nuqs";

/** Drei stats panel when `DEBUG_STATS=true` (nuqs boolean parsing). Must render inside `<Canvas>`. */
export const DebugStats = () => {
  const [enabled] = useQueryState("DEBUG_STATS", parseAsBoolean);
  if (enabled !== true) return null;
  return <Stats />;
};
