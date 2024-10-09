import { useMemo, type HTMLAttributes } from "react";
import {
  AUDIO_SOURCE,
  getPlatformSupportedAudioSources,
  type AudioSource,
} from "@/components/audio/sourceControls/common";
import { FileUploadControls } from "@/components/controls/audioSource/fileUpload";
import { SoundcloudControls } from "@/components/controls/audioSource/soundcloud/controls";
import { useAppStateActions, useAudio } from "@/lib/appState";
import { cn } from "@/lib/utils";
import {
  FileUp,
  Mic,
  Music,
  ScreenShare,
  type LucideProps,
} from "lucide-react";

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
  const { source: activeSource } = useAudio();
  const { setAudio } = useAppStateActions();
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
          onClick={() => setAudio({ source })}
          aria-selected={activeSource === source}
        >
          <AudioSourceIcon audioSource={source} />
        </GridIconWrapper>
      ))}
    </div>
  );
};

export const AudioSourceControls = () => {
  const { source } = useAudio();
  switch (source) {
    case AUDIO_SOURCE.SOUNDCLOUD:
      return <SoundcloudControls />;
    case AUDIO_SOURCE.FILE_UPLOAD:
      return <FileUploadControls />;
    case AUDIO_SOURCE.MICROPHONE:
    case AUDIO_SOURCE.SCREEN_SHARE:
      // TODO: Add controls
      return null;
    default:
      return source satisfies never;
  }
};
