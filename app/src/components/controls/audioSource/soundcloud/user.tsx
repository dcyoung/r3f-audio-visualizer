import { type Dispatch, type HTMLAttributes } from "react";
import { type SoundcloudUser } from "@/lib/soundcloud/models";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";

export const UserCard = ({
  user,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { user: SoundcloudUser }) => {
  return (
    <div
      className={cn(
        "flex w-12 shrink-0 flex-col items-center justify-start gap-1 hover:border hover:border-white aria-selected:animate-pulse aria-selected:border aria-selected:border-white",
        className,
      )}
      {...props}
    >
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          className="aspect-square w-full rounded-full"
          alt="User avatar"
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
  selectedUserId = undefined,
  onUserSelected,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  users: SoundcloudUser[];
  selectedUserId?: number;
  onUserSelected: Dispatch<SoundcloudUser>;
}) => {
  return (
    <div
      className={cn(
        "no-scrollbar flex w-full cursor-pointer flex-row items-center justify-start gap-2 overflow-x-scroll",
        className,
      )}
      {...props}
    >
      {users?.map((user) => (
        <UserCard
          key={user.id}
          aria-selected={selectedUserId === user.id}
          user={user}
          onClick={() => {
            onUserSelected(user);
          }}
        />
      ))}
    </div>
  );
};
