import { Info } from "lucide-react";
import { useMemo } from "react";

import {
  type ApplicationMode,
  getPlatformSupportedApplicationModes,
} from "@/components/applicationModes";
import { ToolbarItem } from "@/components/controls/common";
import { useModeContextSetters } from "@/context/mode";


const ModeSelectButton = ({ mode }: { mode: ApplicationMode }) => {
  const { setMode } = useModeContextSetters();
  return (
    <ToolbarItem onClick={() => setMode(mode)}>
      <Info />
    </ToolbarItem>
  );
};

// const modeParam = new URLSearchParams(document.location.search).get(
//   "mode"
// ) as ApplicationMode | null;
// const { mode } = useControls({
//   mode: {
//     value:
//       modeParam && AVAILABLE_MODES.includes(modeParam)
//         ? modeParam
//         : AVAILABLE_MODES[0],
//     options: AVAILABLE_MODES.reduce(
//       (o, mode) => ({ ...o, [getAppModeDisplayName(mode)]: mode }),
//       {}
//     ),
//     order: -100,
//   },
// });

export const ModesToolbar = () => {
  const availableModes = useMemo(() => {
    return getPlatformSupportedApplicationModes();
  }, []);

  return (
    <div className="pointer-events-none flex flex-row items-center justify-center gap-4">
      {availableModes.map((mode) => (
        <ModeSelectButton mode={mode} key={mode} />
      ))}
    </div>
  );
};

export default ModesToolbar;
