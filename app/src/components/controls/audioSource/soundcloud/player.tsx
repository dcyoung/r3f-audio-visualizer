import {
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
} from "react";
import { useSoundcloudContext } from "@/context/soundcloud";
import { useAppearance } from "@/lib/appState";
import { getTrackStreamUrl } from "@/lib/soundcloud/api";
import { type SoundcloudTrack } from "@/lib/soundcloud/models";
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PauseCircle, PlayCircle } from "lucide-react";

export const TrackPlayer = ({
  audio,
  track,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  audio: HTMLAudioElement;
  track: SoundcloudTrack;
}) => {
  const { showUI } = useAppearance();

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
  }, [audio, streamUrl, track]);

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
        "flex w-fit max-w-xs flex-row items-center justify-start gap-2 rounded-lg p-4 sm:bg-black/25",
        className,
        !showUI && "hidden",
      )}
      {...props}
    >
      <div
        className="pointer-events-auto cursor-pointer rounded-full p-2 hover:scale-110"
        onClick={() => setPlay((curr) => !curr)}
      >
        {/* TODO: Artwork */}
        {play ? <PauseCircle /> : <PlayCircle />}
      </div>
      <div className="hidden flex-col items-start justify-center gap-1 sm:flex">
        <span className="w-64 max-w-64 truncate text-sm text-foreground">
          {track.title}
        </span>
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
  const { track } = useSoundcloudContext();

  if (!track) {
    return <></>;
  }

  return <TrackPlayer track={track} {...props} />;
};
