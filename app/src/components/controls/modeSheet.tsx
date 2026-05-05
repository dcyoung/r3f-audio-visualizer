import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_MODE,
  getPlatformSupportedApplicationModes,
  isAudioMode,
  type TApplicationMode,
} from "@/lib/applicationModes";
import { useAppStateActions, useMode } from "@/lib/appState";
import { COORDINATE_MAPPER_REGISTRY } from "@/lib/mappers/coordinateMappers/registry";
import { AudioWaveform, Brain, Music, Shell, Waves, Wind } from "lucide-react";

import { AudioModeControls } from "./mode/audio";
import { AudioScopeModeControls } from "./mode/audioScope";
import { useSettingsPortalContainer } from "./settingsPortalContainer";

const MODE_DISPLAY_NAMES: Record<TApplicationMode, string> = {
  [APPLICATION_MODE.WAVE_FORM]: "Waveform",
  [APPLICATION_MODE.NOISE]: "Noise",
  [APPLICATION_MODE.AUDIO]: "Audio",
  [APPLICATION_MODE.AUDIO_SCOPE]: "AudioScope",
  [APPLICATION_MODE.PARTICLE_NOISE]: "Particle Noise",
  [APPLICATION_MODE.NEURON]: "Neuron",
};

const ModeIcon = ({ mode }: { mode: TApplicationMode }) => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return <AudioWaveform className="h-4 w-4" />;
    case APPLICATION_MODE.NOISE:
      return <Waves className="h-4 w-4" />;
    case APPLICATION_MODE.AUDIO:
      return <Music className="h-4 w-4" />;
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <Shell className="h-4 w-4" />;
    case APPLICATION_MODE.PARTICLE_NOISE:
      return <Wind className="h-4 w-4" />;
    case APPLICATION_MODE.NEURON:
      return <Brain className="h-4 w-4" />;
    default:
      return mode satisfies never;
  }
};

const ModeSelectEntry = ({ mode }: { mode: TApplicationMode }) => {
  return (
    <div className="flex w-full items-center gap-2.5">
      {isAudioMode(mode) && <span className="text-xs opacity-60">🎧</span>}
      <ModeIcon mode={mode} />
      <span className="text-sm">{MODE_DISPLAY_NAMES[mode]}</span>
    </div>
  );
};

const ModeSelector = () => {
  const mode = useMode();
  const { setMode } = useAppStateActions();
  const settingsPortalContainerRef = useSettingsPortalContainer();

  const availableModes = useMemo(() => {
    return getPlatformSupportedApplicationModes();
  }, []);

  return (
    <Select
      value={mode}
      onValueChange={(v) => {
        setMode(v as (typeof availableModes)[number]);
      }}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={<ModeSelectEntry mode={mode} />}
          className="w-full"
        />
      </SelectTrigger>
      <SelectContent container={settingsPortalContainerRef ?? undefined}>
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

export const ModeSheetContent = () => {
  const mode = useMode();
  return (
    <div className="space-y-4">
      <ModeSelector />
      {mode === APPLICATION_MODE.WAVE_FORM && (
        <COORDINATE_MAPPER_REGISTRY.waveform.ControlsComponent />
      )}
      {mode === APPLICATION_MODE.NOISE && (
        <COORDINATE_MAPPER_REGISTRY.noise.ControlsComponent />
      )}
      {mode === APPLICATION_MODE.AUDIO && <AudioModeControls />}
      {mode === APPLICATION_MODE.AUDIO_SCOPE && <AudioScopeModeControls />}
    </div>
  );
};
