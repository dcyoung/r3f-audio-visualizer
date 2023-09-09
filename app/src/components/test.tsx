import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

export const TestInternal = () => {
  const { data } = useSuspenseQuery({
    queryKey: ["test"],
    queryFn: async () => {
      // const url = `http://localhost:3000/proxy/playlists?${new URLSearchParams({
      const url = `https://soundcloud-api-proxy.fly.dev/proxy/playlists?${new URLSearchParams(
        {
          q: "test",
          access: "playable",
          limit: "5",
        }
      )}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {},
        });
        console.log(await response.json());
        return `SUCCESS retrieving playlists`;
      } catch (err) {
        console.error(err);
        return "FAILED retrieving playlists";
      }
    },
  });
  //   const [playlists] = trpcReact.soundcloud.getPlaylists.useSuspenseQuery(
  //     {
  //       query: "house",
  //     },
  //     {}
  //   );
  //   console.log(playlists);
  //   return <span className="text-5xl text-white">{playlists.length}</span>;
  return <span className="text-5xl text-white">{data}</span>;
};

export const Test = () => {
  return (
    <Suspense
      fallback={<span className="text-5xl text-white">Loading...</span>}
    >
      <TestInternal />
    </Suspense>
  );
};
