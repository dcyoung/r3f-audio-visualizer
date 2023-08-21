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
    <div className="flex flex-col justify-center items-center gap-4 pointer-events-none">
      <ExampleControl />
      <ExampleControl />
      <ExampleControl />
    </div>
  );
};

export default SettingsToolbar;
