import { z } from "zod";

// Schemas to help parse expected Soundcloud API responses
export const UserSchema = z.object({
    avatar_url: z.string(),
    id: z.number(),
    username: z.string(),
});
export type SoundcloudUser = z.infer<typeof UserSchema>;

export const TrackSchema = z.object({
    id: z.number(),
    title: z.string(),
    artwork_url: z.string(),
    playback_count: z.number(),
    user: UserSchema.optional()
});
export type SoundcloudTrack = z.infer<typeof TrackSchema>;

// const PlaylistSchema = z.object({

// });
// export type SoundcloudPlaylist = z.infer<typeof PlaylistSchema>;
