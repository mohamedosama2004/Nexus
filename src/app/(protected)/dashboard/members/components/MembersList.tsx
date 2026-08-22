import type { Member } from "../types";
import { MemberCard } from "./MemberCard";

export function MembersList({ members }: { members: Member[] }) {
  return (
    <ul className="space-y-3">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </ul>
  );
}
