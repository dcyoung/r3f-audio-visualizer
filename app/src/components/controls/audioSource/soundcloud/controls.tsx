import { Suspense, useState } from "react";
import { useSoundcloudContextSetters } from "@/context/soundcloud";
import { getUsers } from "@/lib/soundcloud/api";
import { type SoundcloudUser } from "@/lib/soundcloud/models";
import { useSuspenseQuery } from "@tanstack/react-query";

import { UserTrackList } from "./track";
import { UserList } from "./user";

const SoundcloudUserResults = ({ query }: { query: string }) => {
  const { data: users } = useSuspenseQuery({
    queryKey: ["soundcloud-user-search", query],
    queryFn: async () => {
      return await getUsers({
        query: query,
        limit: 20,
      });
    },
  });

  const [user, setUser] = useState<SoundcloudUser | null>(null);
  const { setTrack } = useSoundcloudContextSetters();

  return (
    <div className="flex flex-col items-start justify-center gap-2">
      <UserList
        users={users.filter((u) => (u.track_count ?? 0) > 0)}
        onUserSelected={setUser}
        selectedUserId={user?.id}
      />
      {user && (
        <Suspense fallback={<span>Loading...</span>}>
          <UserTrackList userId={user.id} onTrackSelected={setTrack} />
        </Suspense>
      )}
    </div>
  );
};

export const SoundcloudSearchResults = ({ query }: { query: string }) => {
  return (
    <Suspense
      fallback={
        <span className="text-muted-foreground text-xs">Searching...</span>
      }
    >
      <SoundcloudUserResults key={query} query={query} />
    </Suspense>
  );
};
