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
import {
  APPLICATION_MODE,
  getPlatformSupportedApplicationModes,
  isAudioMode,
  type TApplicationMode,
} from "@/lib/applicationModes";
import { useAppStateActions, useMode } from "@/lib/appState";
import {
  AudioWaveform,
  Drum,
  HelpCircle,
  Music,
  Shell,
  Waves,
} from "lucide-react";

import { AudioModeControls } from "./mode/audio";
// import { AudioScopeModeControls } from "./mode/audioScope";
import { NoiseGeneratorModeControls } from "./mode/noise";
import { WaveformModeControls } from "./mode/waveform";

const ModeIcon = ({ mode }: { mode: TApplicationMode }) => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return <AudioWaveform />;
    case APPLICATION_MODE.NOISE:
      return <Waves />;
    case APPLICATION_MODE.AUDIO:
      return <Music />;
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <Shell />;
    case APPLICATION_MODE.PARTICLE_NOISE:
      return <Drum />;
    default:
      return <HelpCircle />;
    // return mode satisfies never;
  }
};
const ModeSelectEntry = ({ mode }: { mode: TApplicationMode }) => {
  return (
    <div className="flex w-full items-center justify-start gap-2">
      <div className="w-4">{isAudioMode(mode) && "🎧"}</div>
      <ModeIcon mode={mode} />
      {mode}
    </div>
  );
};

const ModeSelector = () => {
  const mode = useMode();
  const { setMode } = useAppStateActions();

  const availableModes = useMemo(() => {
    return getPlatformSupportedApplicationModes();
  }, []);

  return (
    <Select
      onValueChange={(v) => {
        setMode(v as (typeof availableModes)[number]);
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
  const mode = useMode();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        insertHidden={true}
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
        {/* {mode === APPLICATION_MODE.AUDIO_SCOPE && <AudioScopeModeControls />} */}
      </SheetContent>
    </Sheet>
  );
};
