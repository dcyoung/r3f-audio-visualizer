import classnames from "classnames";
import {
  Activity,
  MoreHorizontal,
  Music,
  Shell,
  Waves,
  Mic,
  ScreenShare,
  FileUp,
  type LucideProps,
} from "lucide-react";
import { type HTMLAttributes, useMemo } from "react";

import {
  AUDIO_SOURCE,
  type AudioSource,
  getPlatformSupportedAudioSources,
} from "@/components/audio/sourceControls/common";
import { ToolbarItem, ToolbarPopover } from "@/components/controls/common";
import {
  useAudioSourceContext,
  useAudioSourceContextSetters,
} from "@/context/audioSource";
import { useModeContext, useModeContextSetters } from "@/context/mode";
import {
  type ApplicationMode,
  getPlatformSupportedApplicationModes,
  APPLICATION_MODE,
} from "@/lib/applicationModes";
import { cn } from "@/lib/utils";

import { FileUploadControls } from "./audio/fileUpload";
import { SoundcloudControls } from "./audio/soundcloud/controls";

const ModeIcon = ({
  mode,
  ...props
}: { mode: ApplicationMode } & LucideProps) => {
  switch (mode) {
    case "WAVE_FORM":
      return <Activity {...props} />;
    case "NOISE":
      return <Waves {...props} />;
    case "AUDIO":
      return <Music {...props} />;
    case "AUDIO_SCOPE":
      return <Shell {...props} />;
    default:
      return mode satisfies never;
  }
};

const AudioSourceIcon = ({
  audioSource,
  ...props
}: { audioSource: AudioSource } & LucideProps) => {
  switch (audioSource) {
    case AUDIO_SOURCE.SOUNDCLOUD:
      return <Music {...props} />;
    case AUDIO_SOURCE.MICROPHONE:
      return <Mic {...props} />;
    case AUDIO_SOURCE.SCREEN_SHARE:
      return <ScreenShare {...props} />;
    case AUDIO_SOURCE.FILE_UPLOAD:
      return <FileUp {...props} />;
    default:
      return audioSource satisfies never;
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
  // const { maxAmplitude, waveformFrequenciesHz, amplitudeSplitRatio } =
  //   useWaveGeneratorContext();
  // const { setMaxAmplitude, setAmplitudeSplitRatio, setWaveformFrequenciesHz } =
  //   useWaveGeneratorContextSetters();
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <span>Wave Form</span>
      <p>...</p>
    </div>
  );
};

const NoiseGeneratorModeControls = () => {
  // const { amplitude, spatialScale, timeScale, nIterations } =
  //   useNoiseGeneratorContext();
  // const { setAmplitude, setSpatialScale, setTimeScale, setNIterations } =
  //   useNoiseGeneratorContextSetters();
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <span>Noise Generator</span>
      <p>...</p>
    </div>
  );
};

const AudioSourceControls = () => {
  const { audioSource } = useAudioSourceContext();
  switch (audioSource) {
    case AUDIO_SOURCE.SOUNDCLOUD:
      return <SoundcloudControls />;
    case AUDIO_SOURCE.FILE_UPLOAD:
      return <FileUploadControls />;
    case AUDIO_SOURCE.MICROPHONE:
    case AUDIO_SOURCE.SCREEN_SHARE:
      // TODO: Add controls
      return null;
    default:
      return audioSource satisfies never;
  }
};

const AudioSourceSelect = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const { audioSource } = useAudioSourceContext();
  const { setAudioSource } = useAudioSourceContextSetters();
  const available = useMemo(() => {
    return getPlatformSupportedAudioSources();
  }, []);

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      {available.map((source) => (
        <div
          key={source}
          onClick={() => setAudioSource(source)}
          className={classnames({
            "pointer-events-auto flex h-4 w-4 cursor-pointer flex-row items-center justify-center duration-300 ease-in-out hover:scale-150":
              true,
            "scale-150": source === audioSource,
          })}
        >
          <AudioSourceIcon audioSource={source} />
        </div>
      ))}
    </div>
  );
};

const AudioModeControls = () => {
  return (
    <div className="flex flex-col items-start justify-center gap-4">
      <span>Audio</span>
      <AudioSourceSelect />
      <AudioSourceControls />
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
      className="w-fit border-0 border-transparent bg-background/50 p-0"
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
