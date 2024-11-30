import { forwardRef, useMemo, useState, type HTMLProps } from "react";
import { VISUAL_REGISTRY } from "@/components/visualizers/registry";
import { useClientDetails } from "@/hooks/use-client-details";
import { useAppStateActions, useMode, useVisual } from "@/lib/appState";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Sheet, SheetContent } from "../ui/sheet";
import { MobileDrawer } from "./mobile-drawer";
import { ModeSheetContent } from "./modeSheet";
import { VisualSettingsSheetContent } from "./visualSettingsSheet";

export const SettingsPanelTrigger = () => {
  const [open, setOpen] = useState(false);
  const { isSmallScreen } = useClientDetails();
  return (
    <>
      <DockItem
        className="pointer-events-auto"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Settings />
      </DockItem>
      {isSmallScreen ? (
        <MobileDrawer open={open} onOpenChange={setOpen}>
          <ModeSheetContent />
          <VisualSettingsSheetContent />
        </MobileDrawer>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            insertHidden={true}
            side="right"
            className="no-scrollbar w-full max-w-full space-y-4 overflow-scroll bg-background/70 p-4 pt-16 sm:w-[430px] sm:max-w-[430px]"
          >
            <ModeSheetContent />
            <VisualSettingsSheetContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

const DockItem = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid size-10 flex-none grow cursor-pointer snap-center place-items-center rounded-sm bg-gradient-to-b from-slate-700 to-black text-white shadow-inner duration-300 ease-in-out hover:scale-110 hover:from-slate-500 hover:to-slate-900 aria-selected:from-slate-100 aria-selected:to-slate-500 aria-selected:text-black",
          className,
        )}
        {...props}
      />
    );
  },
);

const VisualSelector = () => {
  const activeVisual = useVisual();
  const { setVisual } = useAppStateActions();
  const mode = useMode();

  const supportedVisuals = useMemo(() => {
    return Object.values(VISUAL_REGISTRY).filter((visual) =>
      [...visual.supportedApplicationModes].includes(mode),
    );
  }, [mode]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <DockItem className="pointer-events-auto">
          <activeVisual.icon />
        </DockItem>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="pointer-events-auto mb-2 grid h-fit w-fit place-content-center border-white/10 bg-white/10 p-3"
      >
        <div className="grid grid-cols-4 gap-3">
          {supportedVisuals.map((visual) => (
            <DockItem
              key={visual.id}
              aria-selected={visual.id === activeVisual.id}
              onClick={() => setVisual(visual.id)}
              className="aria-selected:animate-bounce"
            >
              <visual.icon />
            </DockItem>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const ApplicationDock = () => {
  return (
    <div className="pointer-events-none absolute bottom-0 flex w-full items-end justify-center gap-4 p-4">
      <div className="pointer-events-none h-fit overflow-hidden bg-transparent sm:max-w-[60%]">
        <div className="pointer-events-auto flex h-full w-full snap-x snap-mandatory flex-row items-center justify-start gap-4 overflow-auto rounded-xl bg-gradient-to-t from-white/10 to-white/0 p-4 shadow-inner">
          <VisualSelector />
          <SettingsPanelTrigger />
        </div>
      </div>
    </div>
  );
};

export default ApplicationDock;
