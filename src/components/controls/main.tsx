import { useState } from "react";

import { ModesToolbar } from "@/components/controls/modesToolbar";
import { SettingsToolbar } from "@/components/controls/settingsToolbar";
import { VisualsToolbar } from "@/components/controls/visualsToolbar";
import { Switch } from "@/components/ui/switch";

export const ControlsPanel = () => {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <div className="pointer-events-none absolute top-0 flex w-full flex-row items-center justify-end gap-2 p-4">
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
          <div className="pointer-events-none absolute top-0 flex h-24 w-full flex-row items-center justify-center p-4">
            <ModesToolbar />
          </div>
          <div className="pointer-events-none absolute bottom-0 flex h-24 w-full flex-row items-center justify-center p-4">
            <VisualsToolbar />
          </div>
          <div className="pointer-events-none absolute right-0 flex h-full w-24 flex-col items-center justify-center p-4">
            <SettingsToolbar />
          </div>
        </>
      )}
    </>
  );
};

export default ControlsPanel;
