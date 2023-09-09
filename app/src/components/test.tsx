import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

export const TestInternal = () => {
  const { data } = useSuspenseQuery({
    queryKey: ["test"],
    queryFn: async () => {
      //   const url = `https://api.soundcloud.com/playlists?${new URLSearchParams(
      const url = `https://soundcloud-api-proxy.fly.dev/proxy/playlists?${new URLSearchParams(
        {
          q: "house",
          access: "playable",
          limit: "1",
        }
      )}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {},
        });
        console.log(response);
        // return await response.json();
        return "SUCCESS";
      } catch (err) {
        console.error(err);
        return "FAILED";
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
