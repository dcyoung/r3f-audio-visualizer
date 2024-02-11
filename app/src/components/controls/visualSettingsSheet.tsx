import { useState, type HTMLAttributes, type PropsWithChildren } from "react";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useModeContext } from "@/context/mode";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";
import { APPLICATION_MODE } from "@/lib/applicationModes";
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

export const VisualSettingsSheet = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);
  const { mode } = useModeContext();
  const { colorBackground, palette, paletteTrackEnergy } = useVisualContext();
  const { setColorBackground, setPalette, setPaletteTrackEnergy } =
    useVisualContextSetters();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
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
                    onClick={() => setPalette(p)}
                    aria-selected={p === palette}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="color-background">Color Background</Label>
              <Switch
                id="color-background"
                defaultChecked={colorBackground}
                onCheckedChange={(e) => {
                  setColorBackground(e);
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="color-background">Follow Music</Label>
              <Switch
                disabled={mode !== APPLICATION_MODE.AUDIO}
                id="color-background"
                defaultChecked={paletteTrackEnergy}
                onCheckedChange={(e) => {
                  setPaletteTrackEnergy(e);
                }}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
