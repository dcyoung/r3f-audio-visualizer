import { useMemo, type HTMLAttributes, type HTMLProps } from "react";
import {
  AUDIO_SOURCE,
  getPlatformSupportedAudioSources,
  type AudioSource,
} from "@/components/audio/sourceControls/common";
import { FileUploadControls } from "@/components/controls/audio/fileUpload";
import { SoundcloudControls } from "@/components/controls/audio/soundcloud/controls";
import { Label } from "@/components/ui/label";
import {
  useAudioSourceContext,
  useAudioSourceContextSetters,
} from "@/context/audioSource";
import { cn } from "@/lib/utils";
import {
  FileUp,
  Mic,
  Music,
  ScreenShare,
  type LucideProps,
} from "lucide-react";

export const ValueLabel = ({
  label,
  value,
  className,
  ...props
}: HTMLProps<HTMLDivElement> & {
  label: string;
  value: string;
}) => {
  return (
    <div
      className={cn("flex w-full items-center justify-between", className)}
      {...props}
    >
      <Label>{label}</Label>
      <span className="w-12 px-2 py-0.5 text-right text-sm text-muted-foreground">
        {value}
      </span>
    </div>
  );
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

const GridIconWrapper = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "grid aspect-square w-full flex-none grow cursor-pointer place-content-center rounded-sm bg-gradient-to-b from-slate-700 to-black text-white shadow-inner duration-300 ease-in-out hover:scale-110 hover:from-slate-500 hover:to-slate-900 aria-selected:from-slate-100 aria-selected:to-slate-500 aria-selected:text-black",
        // "grid aspect-square w-full cursor-pointer place-content-center rounded-full transition-all duration-200 ease-in-out hover:ring-2 hover:ring-primary aria-selected:animate-pulse aria-selected:ring-2 aria-selected:ring-primary",
        className,
      )}
      {...props}
    />
  );
};

export const AudioSourceSelect = ({
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
        "grid w-full grid-cols-6 justify-items-stretch gap-2 sm:grid-cols-8",
        className,
      )}
      {...props}
    >
      {available.map((source) => (
        <GridIconWrapper
          key={`grid_icon_${source}`}
          onClick={() => setAudioSource(source)}
          aria-selected={audioSource === source}
        >
          <AudioSourceIcon audioSource={source} />
        </GridIconWrapper>
      ))}
    </div>
  );
};

export const AudioSourceControls = () => {
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
