import { Grab, Palette, Rotate3d } from "lucide-react";
import { type HTMLAttributes } from "react";

import { isCameraMode } from "@/applicationModes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AVAILABLE_COLOR_PALETTES } from "@/components/visualizers/palettes";
import {
  CAMERA_CONTROLS_MODE,
  useCameraControlsContext,
  useCameraControlsContextSetters,
} from "@/context/cameraControls";
import { useModeContext } from "@/context/mode";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";
import { cn } from "@/lib/utils";

import { ToolbarItem, ToolbarPopover } from "./common";

const ColorsControl = () => {
  const { colorBackground, palette } = useVisualContext();
  const { setColorBackground, setPalette } = useVisualContextSetters();

  return (
    <ToolbarPopover
      trigger={
        <ToolbarItem>
          <Palette />
        </ToolbarItem>
      }
      className="w-fit"
    >
      <div className="justify start flex w-fit flex-col gap-4">
        <Select
          onValueChange={(v) => {
            setPalette(v as (typeof AVAILABLE_COLOR_PALETTES)[number]);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={palette} defaultValue={palette} />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            <SelectGroup>
              <SelectLabel>Color Palette</SelectLabel>
              {AVAILABLE_COLOR_PALETTES.map((palette) => (
                <SelectItem value={palette} key={palette}>
                  {palette}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Switch
            id="color-background"
            defaultChecked={colorBackground}
            onCheckedChange={(e) => {
              setColorBackground(e);
            }}
          />
          <Label htmlFor="color-background">Color Background</Label>
        </div>
      </div>
    </ToolbarPopover>
  );
};

const CameraControls = () => {
  const { mode } = useCameraControlsContext();
  const { setMode } = useCameraControlsContextSetters();

  switch (mode) {
    case CAMERA_CONTROLS_MODE.ORBIT_CONTROLS:
      return (
        <ToolbarItem onClick={() => setMode(CAMERA_CONTROLS_MODE.AUTO_ORBIT)}>
          <Rotate3d />
        </ToolbarItem>
      );
    case CAMERA_CONTROLS_MODE.AUTO_ORBIT:
      return (
        <ToolbarItem
          onClick={() => setMode(CAMERA_CONTROLS_MODE.ORBIT_CONTROLS)}
        >
          <Grab />
        </ToolbarItem>
      );
    default:
      return mode satisfies never;
  }
};

// const TestControl = () => {
//   return (
//     <ToolbarPopover
//       trigger={
//         <ToolbarItem>
//           <Info />
//         </ToolbarItem>
//       }
//       align="end"
//       className="bg-background/50 border-0 border-transparent p-0 w-fit"
//     >
//       <div className="pointer-events-none flex flex-row items-center justify-center gap-4">
//         Test
//       </div>
//     </ToolbarPopover>
//   );
// };

export const SettingsToolbar = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const { mode } = useModeContext();
  return (
    <div
      className={cn(
        "pointer-events-none flex flex-col items-center justify-center gap-4",
        className
      )}
      {...props}
    >
      <ColorsControl />
      {isCameraMode(mode) && <CameraControls />}
      {/* <TestControl /> */}
    </div>
  );
};

export default SettingsToolbar;
