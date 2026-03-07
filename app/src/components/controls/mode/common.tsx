import { useEffect, useMemo, useState } from "react";
import {
  AUDIO_SOURCE,
  getPlatformSupportedAudioSources,
  type TAudioSource,
} from "@/components/audio/sourceControls/common";
import { FileUploadControls } from "@/components/controls/audioSource/fileUpload";
import { SoundcloudSearchResults } from "@/components/controls/audioSource/soundcloud/controls";
import { useAppStateActions, useAudio } from "@/lib/appState";
import { cn } from "@/lib/utils";
import { FileUp, Mic, Music, ScreenShare, Search } from "lucide-react";

const AUDIO_SOURCE_ICONS: Record<TAudioSource, React.ReactNode> = {
  [AUDIO_SOURCE.SOUNDCLOUD]: <Music className="h-4 w-4" />,
  [AUDIO_SOURCE.MICROPHONE]: <Mic className="h-4 w-4" />,
  [AUDIO_SOURCE.FILE_UPLOAD]: <FileUp className="h-4 w-4" />,
  [AUDIO_SOURCE.SCREEN_SHARE]: <ScreenShare className="h-4 w-4" />,
};

const SourceButton = ({
  source,
  isActive,
  onClick,
}: {
  source: TAudioSource;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors",
      isActive
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    )}
  >
    {AUDIO_SOURCE_ICONS[source]}
  </button>
);

export const AudioSourceSelect = () => {
  const { source: activeSource } = useAudio();
  const { setAudio } = useAppStateActions();
  const available = useMemo(() => getPlatformSupportedAudioSources(), []);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const isSoundcloud = activeSource === AUDIO_SOURCE.SOUNDCLOUD;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-input flex items-center gap-1 rounded-lg border p-1 transition-all",
          isSoundcloud && "pr-2",
        )}
      >
        {available.map((source) => (
          <SourceButton
            key={source}
            source={source}
            isActive={activeSource === source}
            onClick={() => {
              setAudio({ source });
              setQuery("");
              setDebouncedQuery("");
            }}
          />
        ))}
        {isSoundcloud && (
          <div className="flex min-w-0 flex-1 items-center gap-1.5 pl-1">
            <Search className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artists..."
              className="search-cancel:appearance-none search-cancel:cursor-pointer text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        )}
      </div>
      {isSoundcloud && debouncedQuery && (
        <SoundcloudSearchResults query={debouncedQuery} />
      )}
    </div>
  );
};

export const AudioSourceControls = () => {
  const { source } = useAudio();
  switch (source) {
    case AUDIO_SOURCE.SOUNDCLOUD:
      return null;
    case AUDIO_SOURCE.FILE_UPLOAD:
      return <FileUploadControls />;
    case AUDIO_SOURCE.MICROPHONE:
    case AUDIO_SOURCE.SCREEN_SHARE:
      return null;
    default:
      return source satisfies never;
  }
};
