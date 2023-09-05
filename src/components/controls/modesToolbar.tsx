import {
  Activity,
  MoreHorizontal,
  MoreVertical,
  Music,
  Shell,
  Waves,
} from "lucide-react";
import { HTMLAttributes, useMemo } from "react";

import {
  type ApplicationMode,
  getPlatformSupportedApplicationModes,
  APPLICATION_MODE,
} from "@/components/applicationModes";
import { ToolbarItem, ToolbarPopover } from "@/components/controls/common";
import { useModeContext, useModeContextSetters } from "@/context/mode";
import { cn } from "@/lib/utils";
import classnames from "classnames";

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

const ModeSelectButton = ({ mode }: { mode: ApplicationMode }) => {
  const { mode: currentMode } = useModeContext();
  const { setMode } = useModeContextSetters();
  return (
    <div className="flex flex-col items-center justify-start">
      <ToolbarItem
        onClick={() => setMode(mode)}
        className={classnames({
          "bg-white/50": mode === currentMode,
        })}
      >
        <ModeIcon mode={mode} />
      </ToolbarItem>
      {mode === currentMode && <ModeSettingsPopover />}
    </div>
  );
};

const WaveformModeControls = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <span>Wave Form</span>
      <p>...</p>
    </div>
  );
};

const NoiseGeneratorModeControls = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <span>Noise Generator</span>
      <p>...</p>
    </div>
  );
};

const AudioModeControls = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <span>Audio</span>
      <p>...</p>
    </div>
  );
};

const ModeSettingsInputs = () => {
  const { mode } = useModeContext();
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return <WaveformModeControls />;
    case APPLICATION_MODE.NOISE:
      return <NoiseGeneratorModeControls />;
    case APPLICATION_MODE.AUDIO:
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <AudioModeControls />;
    default:
      return mode satisfies never;
  }
};

const ModeSettingsPopover = () => {
  return (
    <ToolbarPopover
      trigger={
        <MoreHorizontal className="pointer-events-auto cursor-pointer" />
      }
      align="start"
      className="bg-background/50 border-0 border-transparent p-0 w-fit"
    >
      <ModeSettingsInputs />
    </ToolbarPopover>
  );
};

export const ModesToolbar = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const availableModes = useMemo(() => {
    return getPlatformSupportedApplicationModes();
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none flex flex-row items-center justify-center gap-4",
        className
      )}
      {...props}
    >
      {availableModes.map((mode) => (
        <ModeSelectButton mode={mode} key={mode} />
      ))}
    </div>
  );
};

export default ModesToolbar;
