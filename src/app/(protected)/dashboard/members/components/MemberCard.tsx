import type { Member } from "../types";

const ROLE_STYLES: Record<string, string> = {
  OWNER: "badge-primary",
  ADMIN: "badge-secondary",
  MEMBER: "badge-ghost",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MemberCard({ member }: { member: Member }) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-base-200 bg-base-100 p-4 transition-colors hover:border-base-300 hover:bg-base-200/40">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {getInitials(member.user.name || "?")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-base-content">
          {member.user.name || "Unnamed user"}
        </div>
        <div className="truncate text-xs text-base-content/50">
          {member.user.email}
        </div>
      </div>

      <span
        className={`badge badge-sm font-medium ${ROLE_STYLES[member.role] ?? "badge-ghost"}`}
      >
        {member.role.toLowerCase()}
      </span>
    </li>
  );
}
