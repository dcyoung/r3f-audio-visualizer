import { z } from "zod";
import { createZodFetcher } from "zod-fetch";

const fetchWithZod = createZodFetcher();

const PROXY_URL = "https://soundcloud-api-proxy.fly.dev/proxy";
export const getStreamUrlForGenre = async (genre: string) => {
    const url = `${PROXY_URL}/tracks?${new URLSearchParams(
        {
            genres: genre,
            access: "playable",
            limit: "1",
        }
    )}`;
    const data = await fetchWithZod(
        z.array(z.object({
            id: z.number(),
        })),
        url,
        {
            method: "GET",
        });
    const trackId = data.at(0)?.id;
    if (trackId === undefined) {
        throw new Error("No track found");
    }

    const { http_mp3_128_url } = await fetchWithZod(
        z.object({
            http_mp3_128_url: z.string(),
        }),
        `${PROXY_URL}/tracks/${trackId}/streams`,
        {
            method: "GET",
        });

    return http_mp3_128_url;
} 
