import type { Member } from "../types";
import { UserAvatar } from "@/src/components/UserAvatar";

const ROLE_STYLES: Record<string, string> = {
  OWNER: "badge-primary",
  ADMIN: "badge-secondary",
  MEMBER: "badge-ghost",
};

export function MemberCard({ member }: { member: Member }) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-base-200 bg-base-100 p-4 transition-colors hover:border-base-300 hover:bg-base-200/40">
      <UserAvatar
        name={member.user.name}
        storageKey={member.user.avatarFile?.storageKey ?? null}
        alt={member.user.name || "Member"}
        className="size-11 bg-primary/10 text-primary"
        textClassName="text-sm font-semibold"
        fallback="initials"
      />

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