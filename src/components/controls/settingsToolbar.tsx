import { Grab, Palette, Rotate3d } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAMERA_CONTROLS_MODE,
  useCameraControlsContext,
  useCameraControlsContextSetters,
} from "@/context/cameraControls";
import { useModeContext } from "@/context/mode";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";

import { ToolbarItem, ToolbarPopover } from "./common";
import { isCameraMode } from "../applicationModes";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { AVAILABLE_COLOR_PALETTES } from "../visualizers/palettes";

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

export const SettingsToolbar = () => {
  const { mode } = useModeContext();
  return (
    <div className="pointer-events-none flex flex-col items-center justify-center gap-4">
      <ColorsControl />
      {isCameraMode(mode) && <CameraControls />}
    </div>
  );
};

export default SettingsToolbar;
