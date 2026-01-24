import { z } from "zod";

import { TrackSchema, UserSchema } from "./models";

// The base proxy URL shared across requests
const PROXY_URL = "https://soundcloud-api-proxy.fly.dev/proxy";

export interface ISearchParams {
  query: string;
  limit: number;
}

export const getUsers = async ({ query, limit = 5 }: ISearchParams) => {
  const url = `${PROXY_URL}/users?${new URLSearchParams({
    q: query,
    limit: limit.toString(),
  }).toString()}`;

  const response = await fetch(url, { method: "GET" });
  return z.array(UserSchema).parse(await response.json());
};

export const getUserTracks = async ({
  userId,
  limit = 50,
}: {
  userId: number;
  limit?: number;
}) => {
  const url = `${PROXY_URL}/users/${userId}/tracks?${new URLSearchParams({
    access: "playable",
    limit: limit.toString(),
  }).toString()}`;
  const response = await fetch(url, { method: "GET" });
  const tracks = z.array(TrackSchema).parse(await response.json());

  // Sort descending by playback count
  return tracks.sort(
    (a, b) =>
      (b.playback_count ?? Number.POSITIVE_INFINITY) -
      (a.playback_count ?? Number.POSITIVE_INFINITY),
  );
};

export const getTrackStreamUrl = async (id: number) => {
  const response = await fetch(`${PROXY_URL}/tracks/${id}/streams`, {
    method: "GET",
  });
  const { http_mp3_128_url } = z
    .object({
      http_mp3_128_url: z.string(),
    })
    .parse(await response.json());

  return http_mp3_128_url.replace("https://api.soundcloud.com", PROXY_URL);
};
