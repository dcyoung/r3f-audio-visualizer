import { useState } from "react";
import { ModesToolbar } from "@/components/controls/modesToolbar";
import { SettingsToolbar } from "@/components/controls/settingsToolbar";
import { VisualsToolbar } from "@/components/controls/visualsToolbar";
import { Switch } from "@/components/ui/switch";

export const ControlsPanel = () => {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <div className="absolute top-0 flex flex-row w-full items-center justify-end p-4 pointer-events-none gap-2">
        <Switch
          defaultChecked={visible}
          className="pointer-events-auto cursor-pointer"
          id="controls-visible"
          onCheckedChange={(e) => {
            setVisible(e);
          }}
        />
      </div>
      {visible && (
        <>
          <div className="absolute top-0 flex flex-row w-full items-center justify-center h-24 p-4 pointer-events-none">
            <ModesToolbar />
          </div>
          <div className="absolute bottom-0 flex flex-row w-full items-center justify-center h-24 p-4 pointer-events-none">
            <VisualsToolbar />
          </div>
          <div className="absolute right-0 flex flex-col h-full items-center justify-center w-24 p-4 pointer-events-none">
            <SettingsToolbar />
          </div>
        </>
      )}
    </>
  );
};

export default ControlsPanel;
