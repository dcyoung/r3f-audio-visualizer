import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";

import { SearchFilterInput } from "@/components/controls/searchFilterInput";
import {
  SearchFiltersContextProvider,
  useSearchFiltersContext,
} from "@/context/searchFilters";
import { useSoundcloudContextSetters } from "@/context/soundcloud";
import { getUsers } from "@/lib/soundcloud/api";
import { type SoundcloudUser } from "@/lib/soundcloud/models";


import { UserTrackList } from "./track";
import { UserList } from "./user";

const SouncloudUserSearch = ({ query }: { query: string }) => {
  const { data: users } = useSuspenseQuery({
    queryKey: ["soundcloud-user-search", query],
    queryFn: async () => {
      return await getUsers({
        query: query,
        limit: 5,
      });
    },
  });

  const [user, setUser] = useState<SoundcloudUser | null>(null);
  const { setTrack } = useSoundcloudContextSetters();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <UserList users={users} onUserSelected={setUser} />
      {user && <UserTrackList userId={user.id} onTrackSelected={setTrack} />}
    </div>
  );
};

const SearchedUserList = () => {
  const { query } = useSearchFiltersContext();

  if (!query) {
    return <span className="text-foreground">No results...</span>;
  }
  return (
    <Suspense fallback={<span className="text-foreground">Searching...</span>}>
      <SouncloudUserSearch query={query} />
    </Suspense>
  );
};

const SoundcloudUserSearch = () => {
  return (
    <SearchFiltersContextProvider>
      <SearchFilterInput placeholder="Search Soundcloud users..." />
      <SearchedUserList />
    </SearchFiltersContextProvider>
  );
};

export const SoundcloudControls = ({}) => {
  return <SoundcloudUserSearch />;
};
