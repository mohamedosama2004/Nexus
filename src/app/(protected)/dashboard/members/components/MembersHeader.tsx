import type { ReactNode } from "react";

type MembersHeaderProps = {
  count: number | null;
  action?: ReactNode;
};

export function MembersHeader({ count, action }: MembersHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-base-content">Members</h1>
        <p className="mt-0.5 text-sm text-base-content/50">
          People with access to this workspace
        </p>
      </div>

      <div className="flex items-center gap-3">
        {count !== null && (
          <span className="badge badge-neutral badge-lg">{count}</span>
        )}
        {action}
      </div>
    </div>
  );
}
