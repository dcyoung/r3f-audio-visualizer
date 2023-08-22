import { Info, Palette } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";

import { ToolbarItem, ToolbarPopover } from "./common";
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

const ExampleControl = () => {
  return (
    <ToolbarPopover
      trigger={
        <ToolbarItem>
          <Info />
        </ToolbarItem>
      }
    >
      <div className="flex flex-col">
        <p>Test A</p>
        <p>Test B</p>
        <p>Test C</p>
      </div>
    </ToolbarPopover>
  );
};

export const SettingsToolbar = () => {
  return (
    <div className="pointer-events-none flex flex-col items-center justify-center gap-4">
      <ColorsControl />
      <ExampleControl />
      <ExampleControl />
    </div>
  );
};

export default SettingsToolbar;
