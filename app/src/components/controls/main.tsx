import { ModesToolbar } from "@/components/controls/modesToolbar";
import { SettingsToolbar } from "@/components/controls/settingsToolbar";
import { VisualsToolbar } from "@/components/controls/visualsToolbar";
import { Switch } from "@/components/ui/switch";
import { useModeContext, useModeContextSetters } from "@/context/mode";
import { APPLICATION_MODE } from "@/lib/applicationModes";

export const ControlsPanel = () => {
  const { mode, showUI } = useModeContext();
  const { setShowUI } = useModeContextSetters();
  return (
    <>
      <div className="pointer-events-none absolute top-0 flex w-full flex-row items-center justify-end gap-2 p-4">
        <Switch
          defaultChecked={showUI}
          className="pointer-events-auto cursor-pointer"
          id="controls-visible"
          onCheckedChange={(e) => {
            setShowUI(e);
          }}
        />
      </div>
      {showUI && (
        <>
          <div className="pointer-events-none absolute top-0 flex h-24 w-full flex-row items-start justify-center p-4">
            <ModesToolbar />
          </div>
          {mode !== APPLICATION_MODE.AUDIO_SCOPE && (
            <div className="pointer-events-none absolute bottom-0 flex h-24 w-full flex-row items-center justify-center p-4">
              <VisualsToolbar />
            </div>
          )}
          <div className="pointer-events-none absolute right-0 flex h-full w-24 flex-col items-center justify-center p-4">
            <SettingsToolbar />
          </div>
        </>
      )}
    </>
  );
};

export default ControlsPanel;
