import { useMemo, useState } from "react";
import { VISUAL_REGISTRY } from "@/components/visualizers/registry";
import { useAppStateActions, useMode, useVisual } from "@/lib/appState";
import { cn } from "@/lib/utils";
import { Palette, Settings } from "lucide-react";

import { Dock, DockCard } from "../ui/dock";
import { Sheet } from "../ui/sheet";
import { ModeSheetContent } from "./modeSheet";
import { VisualSettingsSheetContent } from "./visualSettingsSheet";

export const SettingsDockCard = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DockCard
        key="settings"
        id="settings"
        handleClick={() => setOpen((prev) => !prev)}
      >
        <Settings />
      </DockCard>
      <Sheet open={open} onOpenChange={setOpen}>
        <ModeSheetContent />
        <VisualSettingsSheetContent />
      </Sheet>
    </>
  );
};

export const VisualSettingsSheetDockCard = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DockCard
        key="visual-settings"
        id="visual-settings"
        handleClick={() => setOpen((prev) => !prev)}
      >
        <Palette />
      </DockCard>
      <Sheet open={open} onOpenChange={setOpen}>
        <VisualSettingsSheetContent />
      </Sheet>
    </>
  );
};

export const ApplicationDock = () => {
  const activeVisual = useVisual();
  const { setVisual } = useAppStateActions();
  const mode = useMode();

  const supportedVisuals = useMemo(() => {
    return Object.values(VISUAL_REGISTRY).filter((visual) =>
      [...visual.supportedApplicationModes].includes(mode),
    );
  }, [mode]);
  return (
    <Dock fixedChildren={<SettingsDockCard />}>
      {supportedVisuals.map((visual) => (
        <DockCard
          key={visual.id}
          id={visual.id}
          handleClick={() => setVisual(visual.id)}
          active={activeVisual.id === visual.id}
          className={cn({
            "from-slate-500": activeVisual.id === visual.id,
          })}
        >
          <visual.icon />
        </DockCard>
      ))}
    </Dock>
  );
};

export default ApplicationDock;
