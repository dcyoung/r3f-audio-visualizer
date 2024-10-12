import VisualsDock from "@/components/controls/dock";
import { Switch } from "@/components/ui/switch";
import { useAppearance, useAppStateActions } from "@/lib/appState";

export const ControlsPanel = () => {
  const { showUI } = useAppearance();
  const { setAppearance } = useAppStateActions();
  return (
    <>
      <div className="pointer-events-none absolute top-0 flex w-full flex-row items-center justify-end gap-2 p-4">
        <Switch
          defaultChecked={showUI}
          className="pointer-events-auto cursor-pointer"
          id="controls-visible"
          onCheckedChange={(e) => {
            setAppearance({ showUI: e });
          }}
        />
      </div>
      {showUI && <VisualsDock />}
    </>
  );
};

export default ControlsPanel;
