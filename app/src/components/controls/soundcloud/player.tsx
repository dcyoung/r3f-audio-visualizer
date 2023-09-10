import { useSuspenseQuery } from "@tanstack/react-query";
import { PauseCircle, PlayCircle } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  useEffect,
  useState,
} from "react";

import { useSoundcloudTrack } from "@/lib/appState";
import { getTrackStreamUrl } from "@/lib/soundcloud/api";
import { type SoundcloudTrack } from "@/lib/soundcloud/models";
import { cn } from "@/lib/utils";

export const TrackPlayer = ({
  audio,
  track,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  audio: HTMLAudioElement;
  track: SoundcloudTrack;
}) => {
  const { data: streamUrl } = useSuspenseQuery({
    queryKey: ["soundcloud-stream-url", track.id],
    queryFn: async () => {
      return await getTrackStreamUrl(track.id);
    },
  });

  const [play, setPlay] = useState(true);

  useEffect(() => {
    if (!streamUrl) {
      audio.pause();
    } else {
      audio.src = streamUrl;
      const promise = audio.play();
      if (promise !== undefined) {
        promise
          .then(() => console.log(`Playing ${track.title}`))
          .catch((_) => {
            // Auto-play was prevented
            console.error(`Error playing ${track.title}`);
          });
      }
    }
    return () => {
      audio.pause();
    };
  }, [audio, streamUrl]);

  useEffect(() => {
    if (play) {
      const promise = audio.play();
      if (promise !== undefined) {
        promise
          .then(() => console.log(`Playing...`))
          .catch((_) => {
            // Auto-play was prevented
            console.error(`Error playing!`);
          });
      }
    } else {
      audio.pause();
    }
    return () => {
      audio.pause();
    };
  }, [audio, play]);

  return (
    <div
      className={cn(
        "flex flex-row gap-2 items-center justify-start p-8 rounded-lg",
        className
      )}
      {...props}
    >
      <div
        className="cursor-pointer rounded-full p-2 hover:scale-110"
        onClick={() => setPlay((curr) => !curr)}
      >
        {/* TODO: Artwork */}
        {play ? <PauseCircle /> : <PlayCircle />}
      </div>
      <div className="flex flex-col items-start justify-center gap-1">
        <span className="truncate text-sm text-foreground">{track.title}</span>
        <span className="truncate text-xs text-foreground/50">
          {track.user?.username ?? "Unknown Artist"}
        </span>
      </div>
    </div>
  );
};

export const CurrentTrackPlayer = ({
  ...props
}: Omit<ComponentPropsWithoutRef<typeof TrackPlayer>, "track">) => {
  const currentTrack = useSoundcloudTrack();

  if (!currentTrack) {
    return <></>;
  }

  return <TrackPlayer track={currentTrack} {...props} />;
};
