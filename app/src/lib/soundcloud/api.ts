import { z } from "zod";
import { createZodFetcher } from "zod-fetch";

import { TrackSchema, UserSchema } from "./models";

// The base proxy URL shared across requests
const PROXY_URL = "https://soundcloud-api-proxy.fly.dev/proxy";

// A zod fetcher used for schema safe fetch requests
const fetchWithZod = createZodFetcher();

export interface ISearchParams {
  query: string;
  limit: number;
}

export const getUsers = async ({ query, limit = 5 }: ISearchParams) => {
  const url = `${PROXY_URL}/users?${new URLSearchParams({
    q: query,
    limit: limit.toString(),
  }).toString()}`;
  return await fetchWithZod(z.array(UserSchema), url, {
    method: "GET",
  });
};

export const getTracks = async ({ query, limit = 5 }: ISearchParams) => {
  const url = `${PROXY_URL}/users?${new URLSearchParams({
    q: query,
    limit: limit.toString(),
  }).toString()}`;
  return await fetchWithZod(z.array(UserSchema), url, {
    method: "GET",
  });
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
  const tracks = await fetchWithZod(z.array(TrackSchema), url, {
    method: "GET",
  });

  // Sort descending by playback count
  return tracks.sort(
    (a, b) =>
      (b.playback_count ?? Number.POSITIVE_INFINITY) -
      (a.playback_count ?? Number.POSITIVE_INFINITY),
  );
};

export const getTrackStreamUrl = async (id: number) => {
  const { http_mp3_128_url } = await fetchWithZod(
    z.object({
      http_mp3_128_url: z.string(),
    }),
    `${PROXY_URL}/tracks/${id}/streams`,
    {
      method: "GET",
    },
  );

  return http_mp3_128_url;
};
