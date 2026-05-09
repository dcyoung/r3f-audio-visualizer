import { type HTMLAttributes } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  APPLICATION_MODE,
  isAudioScopeMode,
  isCameraMode,
} from "@/lib/applicationModes";
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
import { Eye, Orbit, Palette, Radio } from "lucide-react";

import { SwitchRow } from "./common";
import { ModeSheetContent } from "./modeSheet";

const FLUID_VISUAL_IDS = new Set(["fluidBox", "fluidSpeaker", "fluidBall"]);
const HIDE_APPEARANCE_VISUAL_IDS = new Set(["waveHistory"]);

const PaletteBand = ({
  palette,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { palette: ColorPaletteType }) => {
  const cp = ColorPalette.getPalette(palette);
  return (
    <div
      className={cn("h-3 w-full rounded-full", className)}
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
        "hover:ring-primary aria-selected:ring-primary aspect-square cursor-pointer rounded-full transition-all duration-200 ease-in-out hover:ring-2 aria-selected:animate-pulse aria-selected:ring-2",
        className,
      )}
      style={{
        background: `linear-gradient(45deg, ${cp.colors.join(",")})`,
      }}
      {...props}
    />
  );
};

const SectionLabel = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <span className="flex items-center gap-2.5">
    <span className="text-muted-foreground">{icon}</span>
    <span className="text-sm font-medium">{title}</span>
  </span>
);

const InputModeSection = () => (
  <AccordionItem value="input-mode">
    <AccordionTrigger>
      <SectionLabel icon={<Radio className="h-4 w-4" />} title="Input Mode" />
    </AccordionTrigger>
    <AccordionContent>
      <ModeSheetContent />
    </AccordionContent>
  </AccordionItem>
);

const VisualizerSection = () => {
  const visual = useVisual();
  if (!visual.ControlsComponent) return null;
  return (
    <AccordionItem value="visualizer">
      <AccordionTrigger>
        <SectionLabel icon={<Eye className="h-4 w-4" />} title="Visualizer" />
      </AccordionTrigger>
      <AccordionContent>
        <visual.ControlsComponent />
      </AccordionContent>
    </AccordionItem>
  );
};

const AppearanceSection = () => {
  const mode = useMode();
  const { colorBackground, paletteTrackEnergy } = useAppearance();
  const palette = usePalette();
  const { setAppearance } = useAppStateActions();

  return (
    <AccordionItem value="appearance">
      <AccordionTrigger>
        <SectionLabel
          icon={<Palette className="h-4 w-4" />}
          title="Appearance"
        />
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-5">
          <div className="space-y-3">
            <PaletteBand palette={palette} />
            <div className="grid w-full grid-cols-6 justify-items-stretch gap-2 sm:grid-cols-8">
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
          <SwitchRow
            label="Color Background"
            checked={colorBackground}
            onCheckedChange={(e) => setAppearance({ colorBackground: e })}
          />
          <SwitchRow
            label="Colors Follow Music"
            checked={paletteTrackEnergy}
            onCheckedChange={(e) => setAppearance({ paletteTrackEnergy: e })}
            disabled={mode !== APPLICATION_MODE.AUDIO}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const BehaviorSection = () => {
  const mode = useMode();
  const { autoOrbitAfterSleepMs } = useCameraState();
  const { setCamera } = useAppStateActions();

  return (
    <AccordionItem value="behavior">
      <AccordionTrigger>
        <SectionLabel
          icon={<Orbit className="h-4 w-4" />}
          title="Camera & Behavior"
        />
      </AccordionTrigger>
      <AccordionContent>
        <SwitchRow
          label="Auto Orbit"
          checked={autoOrbitAfterSleepMs > 0}
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
          disabled={!isCameraMode(mode)}
        />
      </AccordionContent>
    </AccordionItem>
  );
};

export const SettingsPanel = () => {
  const mode = useMode();
  const visual = useVisual();
  const isScope = isAudioScopeMode(mode);
  const isFluid = FLUID_VISUAL_IDS.has(visual.id);
  const hideAppearance = HIDE_APPEARANCE_VISUAL_IDS.has(visual.id);

  return (
    <Accordion multiple defaultValue={["input-mode"]} className="w-full">
      <InputModeSection />
      <VisualizerSection />
      {!isScope && !isFluid && !hideAppearance && <AppearanceSection />}
      {!isScope && <BehaviorSection />}
    </Accordion>
  );
};
