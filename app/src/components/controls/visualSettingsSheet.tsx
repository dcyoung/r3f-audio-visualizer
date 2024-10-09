import { useState, type HTMLAttributes, type PropsWithChildren } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { APPLICATION_MODE, isCameraMode } from "@/lib/applicationModes";
import {
  useAppearance,
  useAppStateActions,
  useCameraState,
  useMode,
  usePalette,
  useVisual,
} from "@/lib/appState";
import {
  AVAILABLE_COLOR_PALETTES,
  ColorPalette,
  type ColorPaletteType,
} from "@/lib/palettes";
import { cn } from "@/lib/utils";

const PaletteBand = ({
  palette,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { palette: ColorPaletteType }) => {
  const cp = ColorPalette.getPalette(palette);
  return (
    <div
      className={cn("h-8 w-full rounded-sm", className)}
      style={{
        background: `linear-gradient(0.25turn, ${cp.colors.join(",")})`,
      }}
      {...props}
    />
  );
};

const PaletteIcon = ({
  palette,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { palette: ColorPaletteType }) => {
  const cp = ColorPalette.getPalette(palette);
  return (
    <div
      className={cn(
        "aspect-square cursor-pointer rounded-full transition-all duration-200 ease-in-out hover:ring-2 hover:ring-primary aria-selected:animate-pulse aria-selected:ring-2 aria-selected:ring-primary",
        className,
      )}
      style={{
        background: `linear-gradient(45deg, ${cp.colors.join(",")})`,
      }}
      {...props}
    />
  );
};

const VisualControlsComponent = () => {
  const visual = useVisual();
  return visual.ControlsComponent ? <visual.ControlsComponent /> : null;
};

export const VisualSettingsSheet = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);
  const mode = useMode();
  const { colorBackground, paletteTrackEnergy } = useAppearance();
  const palette = usePalette();
  const { setAppearance } = useAppStateActions();
  const { autoOrbitAfterSleepMs } = useCameraState();
  const { setCamera } = useAppStateActions();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        insertHidden={true}
        side="right"
        className="no-scrollbar w-full max-w-full overflow-scroll bg-background/70 sm:w-[540px] sm:max-w-[540px]"
      >
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="">Palette</div>
              <PaletteBand palette={palette} />
              <div className="grid w-full grid-cols-4 justify-items-stretch gap-2 sm:grid-cols-6">
                {AVAILABLE_COLOR_PALETTES.map((p) => (
                  <PaletteIcon
                    key={p}
                    palette={p}
                    onClick={() => setAppearance({ palette: p })}
                    aria-selected={p === palette}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label>Color Background</Label>
              <Switch
                defaultChecked={colorBackground}
                onCheckedChange={(e) => setAppearance({ colorBackground: e })}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label>Colors Follow Music</Label>
              <Switch
                disabled={mode !== APPLICATION_MODE.AUDIO}
                defaultChecked={paletteTrackEnergy}
                onCheckedChange={(e) =>
                  setAppearance({ paletteTrackEnergy: e })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label>Auto Orbit Camera</Label>
              <Switch
                disabled={!isCameraMode(mode)}
                defaultChecked={autoOrbitAfterSleepMs > 0}
                onCheckedChange={(e) => {
                  setCamera(
                    e
                      ? {
                          mode: "AUTO_ORBIT",
                          autoOrbitAfterSleepMs: 3500,
                        }
                      : {
                          mode: "ORBIT_CONTROLS",
                          autoOrbitAfterSleepMs: 0,
                        },
                  );
                }}
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <VisualControlsComponent />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
