import { Info } from "lucide-react";

import { ToolbarItem, ToolbarPopover } from "./common";

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
      <ExampleControl />
      <ExampleControl />
      <ExampleControl />
    </div>
  );
};

export default SettingsToolbar;
