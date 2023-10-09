import { useSuspenseQuery } from "@tanstack/react-query";
import { Image } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type Dispatch,
  type HTMLAttributes,
} from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserTracks } from "@/lib/soundcloud/api";
import { type SoundcloudTrack } from "@/lib/soundcloud/models";
import { cn } from "@/lib/utils";

export const TrackCard = ({
  track,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { track: SoundcloudTrack }) => {
  return (
    <div
      className={cn(
        "flex flex-row justify-start items-center gap-2 hover:scale-110",
        className
      )}
      {...props}
    >
      {track.artwork_url ? (
        <img src={track.artwork_url} className="h-8 w-8 rounded-lg" />
      ) : (
        <Image />
      )}
      <div className="flex flex-col items-start justify-center gap-1">
        <span className="truncate text-xs text-foreground">{track.title}</span>
        <span className="truncate text-xs text-foreground/50">
          playcount: {track.playback_count}
        </span>
      </div>
    </div>
  );
};

export const TrackList = ({
  tracks,
  onTrackSelected,
  // pageSize = 10,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ScrollArea> & {
  tracks: SoundcloudTrack[];
  onTrackSelected: Dispatch<SoundcloudTrack>;
  // pageSize?: number;
}) => {
  // const [pageIdx, setPageIndex] = useState(0);
  // const maxPageIdx = Math.ceil(tracks.length / pageSize);

  return (
    <ScrollArea
      className={cn("flex flex-col gap-2 items-start justify-start", className)}
      {...props}
    >
      {tracks.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          onClick={() => {
            onTrackSelected(track);
          }}
        />
      ))}
    </ScrollArea>
  );
};

export const UserTrackList = ({
  userId,
  limit = 10,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof TrackList>, "tracks"> & {
  userId: number;
  limit?: number;
}) => {
  const { data: tracks } = useSuspenseQuery({
    queryKey: ["soundcloud-user-track-search", userId],
    queryFn: async () => {
      return await getUserTracks({
        userId: userId,
        limit: limit,
      });
    },
  });

  return <TrackList tracks={tracks} {...props} />;
};
