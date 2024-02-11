import { type HTMLAttributes } from "react";
import {
  CAMERA_CONTROLS_MODE,
  useCameraControlsContext,
  useCameraControlsContextSetters,
} from "@/context/cameraControls";
import { useModeContext } from "@/context/mode";
import { isCameraMode } from "@/lib/applicationModes";
import { cn } from "@/lib/utils";
import { Grab, Palette, Rotate3d, Settings } from "lucide-react";

import { Dock, DockItem, DockNav } from "./dock";
import { ModeSheet } from "./modeSheet";
import { VisualSettingsSheet } from "./visualSettingsSheet";

const CameraControlsDockItem = () => {
  const { mode } = useCameraControlsContext();
  const { setMode } = useCameraControlsContextSetters();
  return (
    <DockItem
      className="rounded-full"
      onClick={() => {
        setMode((prev) => {
          switch (prev) {
            case CAMERA_CONTROLS_MODE.ORBIT_CONTROLS:
              return CAMERA_CONTROLS_MODE.AUTO_ORBIT;
            case CAMERA_CONTROLS_MODE.AUTO_ORBIT:
              return CAMERA_CONTROLS_MODE.ORBIT_CONTROLS;
            default:
              return prev satisfies never;
          }
        });
      }}
    >
      {mode === CAMERA_CONTROLS_MODE.ORBIT_CONTROLS ? (
        <Rotate3d />
      ) : mode === CAMERA_CONTROLS_MODE.AUTO_ORBIT ? (
        <Grab />
      ) : (
        (mode satisfies never)
      )}
    </DockItem>
  );
};

export const SettingsDock = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const { mode } = useModeContext();

  return (
    <Dock {...props} className={cn("max-h-4/5 w-fit sm:h-fit", className)}>
      <DockNav className="snap-y flex-col bg-gradient-to-l sm:snap-x sm:flex-row sm:bg-gradient-to-t">
        <ModeSheet>
          <DockItem className="rounded-full">
            <Settings />
          </DockItem>
        </ModeSheet>
        <VisualSettingsSheet>
          <DockItem className="rounded-full">
            <Palette />
          </DockItem>
        </VisualSettingsSheet>
        {isCameraMode(mode) && <CameraControlsDockItem />}
      </DockNav>
    </Dock>
  );
};

export default SettingsDock;
