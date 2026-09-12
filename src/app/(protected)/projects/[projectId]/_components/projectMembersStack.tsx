import { UserAvatar } from "@/src/components/UserAvatar";
import type { ProjectMemberWithUser } from "./types";

const MAX_VISIBLE = 4;

export default function ProjectMembersStack({
  members,
}: {
  members: ProjectMemberWithUser[];
}) {
  if (members.length === 0) {
    return null;
  }

  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((member) => (
        <UserAvatar
          key={member.id}
          name={member.user.name}
          storageKey={member.user.avatarFile?.storageKey ?? null}
          alt={member.user.name}
          title={member.user.name}
          className="size-8 border-2 border-base-100 bg-primary/20 text-primary"
          textClassName="text-xs font-bold"
          fallback="initial"
        />
      ))}
      {overflow > 0 && (
        <div className="flex size-8 items-center justify-center rounded-full border-2 border-base-100 bg-base-200 text-[10px] font-bold text-base-content/50">
          +{overflow}
        </div>
      )}
    </div>
  );
}