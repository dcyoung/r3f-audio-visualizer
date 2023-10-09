import { Grab, Palette, Rotate3d } from "lucide-react";
import { type HTMLAttributes } from "react";

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
import {
  CAMERA_CONTROLS_MODE,
  useCameraControlsContext,
  useCameraControlsContextSetters,
} from "@/context/cameraControls";
import { useModeContext } from "@/context/mode";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";
import { APPLICATION_MODE, isCameraMode } from "@/lib/applicationModes";
import { AVAILABLE_COLOR_PALETTES } from "@/lib/palettes";
import { cn } from "@/lib/utils";

import { ToolbarItem, ToolbarPopover } from "./common";

const ColorsControl = () => {
  const { mode } = useModeContext();
  const { colorBackground, palette, paletteTrackEnergy } = useVisualContext();
  const { setColorBackground, setPalette, setPaletteTrackEnergy } =
    useVisualContextSetters();

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
        {mode === APPLICATION_MODE.AUDIO && (
          <div className="flex items-center space-x-2">
            <Switch
              id="color-background"
              defaultChecked={paletteTrackEnergy}
              onCheckedChange={(e) => {
                setPaletteTrackEnergy(e);
              }}
            />
            <Label htmlFor="color-background">Follow Music</Label>
          </div>
        )}
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
    </div>
  );
};

export default SettingsToolbar;
