import { Image } from "lucide-react";
import { type Dispatch, type HTMLAttributes } from "react";

import { type SoundcloudUser } from "@/lib/soundcloud/models";
import { cn } from "@/lib/utils";

export const UserCard = ({
  user,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { user: SoundcloudUser }) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-start items-center gap-1 hover:scale-110 w-12",
        className
      )}
      {...props}
    >
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          className="aspect-square w-full rounded-full"
        />
      ) : (
        <Image />
      )}
      <span className="w-full truncate text-xs text-foreground">
        {user.username}
      </span>
    </div>
  );
};

export const UserList = ({
  users,
  onUserSelected,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  users: SoundcloudUser[];
  onUserSelected: Dispatch<SoundcloudUser>;
}) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-2 items-center justify-start",
        className
      )}
      {...props}
    >
      {users?.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onClick={() => {
            onUserSelected(user);
          }}
        />
      ))}
    </div>
  );
};
