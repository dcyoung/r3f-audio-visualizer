import { useSuspenseQuery } from "@tanstack/react-query";
import { folder, useControls } from "leva";
import { Suspense, useEffect } from "react";

import { type AudioSourceControlsProps } from "@/components/audio/sourceControls/common";
import { getStreamUrlForGenre } from "@/lib/soundcloud";

const SoundcloudGenreController = ({
  audio,
  genre,
}: AudioSourceControlsProps & { genre: string }) => {
  const { data: streamUrl } = useSuspenseQuery({
    queryKey: ["soundcloud", genre],
    queryFn: async () => {
      return await getStreamUrlForGenre(genre);
    },
  });

  /**
   * Make sure the correct stream is playing
   */
  useEffect(() => {
    if (!streamUrl) {
      audio.pause();
      return;
    }
    audio.src = streamUrl;
    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => console.log(`Playing ${streamUrl}`))
        .catch((_) => {
          // Auto-play was prevented
          console.error(`Error playing ${streamUrl}`);
        });
    }
    return () => {
      audio.pause();
    };
  }, [audio, streamUrl]);

  return <></>;
};

const InternalLivestreamAudioControls = ({
  genres,
  ...props
}: AudioSourceControlsProps & { genres: [string, ...string[]] }) => {
  const { genre: selectedGenre } = useControls({
    Audio: folder({
      genre: {
        value: genres[0],
        options: genres,
        order: -99,
      },
    }),
  });

  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] w-[100dvh] flex-row items-center justify-center">
          <span className="text-5xl text-white">Loading...</span>
        </div>
      }
    >
      <SoundcloudGenreController genre={selectedGenre} {...props} />
    </Suspense>
  );
};

const LivestreamAudioControls = ({ audio }: AudioSourceControlsProps) => {
  return (
    <InternalLivestreamAudioControls
      audio={audio}
      genres={[
        "Jazz",
        "Electronic",
        "Rock",
        "Reggae",
        "Classical",
        "Piano",
        "Flamenco",
        "Ambient",
        "Metal",
        "Soul",
        "Funk",
        "Latin",
        "House",
        "Drum and Bass",
      ]}
    />
  );
};

export default LivestreamAudioControls;
