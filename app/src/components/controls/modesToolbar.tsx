import { useSuspenseQuery } from "@tanstack/react-query";
import classnames from "classnames";
import { Activity, MoreHorizontal, Music, Shell, Waves } from "lucide-react";
import { type HTMLAttributes, useMemo, Suspense, useState } from "react";

import { ToolbarItem, ToolbarPopover } from "@/components/controls/common";
import { useModeContext, useModeContextSetters } from "@/context/mode";
import {
  SearchFiltersContextProvider,
  useSearchFiltersContext,
} from "@/context/searchFilters";
import { useSoundcloudContextSetters } from "@/context/soundcloud";
import {
  type ApplicationMode,
  getPlatformSupportedApplicationModes,
  APPLICATION_MODE,
} from "@/lib/applicationModes";
import { getUsers } from "@/lib/soundcloud/api";
import { type SoundcloudUser } from "@/lib/soundcloud/models";
import { cn } from "@/lib/utils";

import { SearchFilterInput } from "./searchFilterInput";
import { UserTrackList } from "./soundcloud/track";
import { UserList } from "./soundcloud/user";

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

const SouncloudUserSearch = ({ query }: { query: string }) => {
  const { data: users } = useSuspenseQuery({
    queryKey: ["soundcloud-user-search", query],
    queryFn: async () => {
      return await getUsers({
        query: query,
        limit: 5,
      });
    },
  });

  const [user, setUser] = useState<SoundcloudUser | null>(null);
  const { setTrack } = useSoundcloudContextSetters();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <UserList users={users} onUserSelected={setUser} />
      {user && <UserTrackList userId={user.id} onTrackSelected={setTrack} />}
    </div>
  );
};

const SearchedUserList = () => {
  const { query } = useSearchFiltersContext();

  if (!query) {
    return <span className="text-foreground">No results...</span>;
  }
  return (
    <Suspense fallback={<span className="text-foreground">Searching...</span>}>
      <SouncloudUserSearch query={query} />
    </Suspense>
  );
};

const SoundcloudUserSearch = () => {
  return (
    <SearchFiltersContextProvider>
      <SearchFilterInput placeholder="Search Soundcloud users..." />
      <SearchedUserList />
    </SearchFiltersContextProvider>
  );
};

const AudioModeControls = () => {
  return (
    <div className="flex flex-col items-start justify-center gap-4">
      <span>Audio</span>
      <SoundcloudUserSearch />
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
