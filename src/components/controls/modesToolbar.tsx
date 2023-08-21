import { ToolbarItem } from "@/components/controls/common";
import { Info } from "lucide-react";
import {
  ApplicationMode,
  getPlatformSupportedApplicationModes,
} from "@/components/applicationModes";
import { useModeContextSetters } from "@/context/mode";
import { useMemo } from "react";

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
    <div className="flex flex-row justify-center items-center gap-4 pointer-events-none">
      {availableModes.map((mode) => (
        <ModeSelectButton mode={mode} key={mode} />
      ))}
    </div>
  );
};

export default ModesToolbar;
