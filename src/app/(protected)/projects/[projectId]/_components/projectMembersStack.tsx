import type { ProjectMemberWithUser } from "./types";

const MAX_VISIBLE = 4;

function getInitial(name: string) {
  return (name.trim()[0] ?? "?").toUpperCase();
}

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
        <div
          key={member.id}
          title={member.user.name}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-base-100 bg-primary/20 text-xs font-bold text-primary"
        >
          {getInitial(member.user.name)}
        </div>
      ))}
      {overflow > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-base-100 bg-base-200 text-[10px] font-bold text-base-content/50">
          +{overflow}
        </div>
      )}
    </div>
  );
}
