import { useMemo, useState, type PropsWithChildren } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useModeContext, useModeContextSetters } from "@/context/mode";
import {
  APPLICATION_MODE,
  getPlatformSupportedApplicationModes,
  isAudioMode,
  type ApplicationMode,
} from "@/lib/applicationModes";
import { Activity, Music, Shell, Waves } from "lucide-react";

import { AudioModeControls } from "./mode/audio";
import { AudioScopeModeControls } from "./mode/audioScope";
import { NoiseGeneratorModeControls } from "./mode/noise";
import { WaveformModeControls } from "./mode/waveform";

const ModeIcon = ({ mode }: { mode: ApplicationMode }) => {
  switch (mode) {
    case "WAVE_FORM":
      return <Activity />;
    case "NOISE":
      return <Waves />;
    case "AUDIO":
      return <Music />;
    case "AUDIO_SCOPE":
      return <Shell />;
    default:
      return mode satisfies never;
  }
};
const ModeSelectEntry = ({ mode }: { mode: ApplicationMode }) => {
  return (
    <div className="flex w-full items-center justify-start gap-2">
      <div className="w-4">{isAudioMode(mode) && "🎧"}</div>
      <ModeIcon mode={mode} />
      {mode}
    </div>
  );
};

const ModeSelector = () => {
  const { mode } = useModeContext();
  const { setMode } = useModeContextSetters();

  const availableModes = useMemo(() => {
    return getPlatformSupportedApplicationModes();
  }, []);

  return (
    <Select
      onValueChange={(v) => {
        setMode(v as ApplicationMode);
      }}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={<ModeSelectEntry mode={mode} />}
          defaultValue={mode}
          className="w-full"
        />
      </SelectTrigger>
      <SelectContent>
        {availableModes.map((v) => (
          <SelectItem
            value={v}
            key={`select_item_${v}`}
            aria-selected={v === mode}
          >
            <ModeSelectEntry mode={v} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const ModeSheet = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);
  const { mode } = useModeContext();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="no-scrollbar w-full max-w-full space-y-4 overflow-scroll bg-background/70 p-4 pt-16 sm:w-[540px] sm:max-w-[540px]"
      >
        <div className="flex items-center justify-start gap-4">
          <span className="text-xl font-bold">MODE</span>
          <ModeSelector />
        </div>
        <Separator />
        {mode === APPLICATION_MODE.WAVE_FORM && <WaveformModeControls />}
        {mode === APPLICATION_MODE.NOISE && <NoiseGeneratorModeControls />}
        {mode === APPLICATION_MODE.AUDIO && <AudioModeControls />}
        {mode === APPLICATION_MODE.AUDIO_SCOPE && <AudioScopeModeControls />}
      </SheetContent>
    </Sheet>
  );
};
