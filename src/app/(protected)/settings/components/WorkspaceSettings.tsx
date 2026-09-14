import type { Role } from "@/src/generated/prisma/enums";

import { SettingsSection } from "./SettingsSection";
import { WorkspaceNameForm } from "./WorkspaceNameForm";
import { LeaveWorkspace } from "./LeaveWorkspace";

export type WorkspaceSettingsProps = {
  workspaceName: string | null;
  role: Role | null;
  canEditWorkspace: boolean;
  canLeaveWorkspace: boolean;
};

export function WorkspaceSettings({
  workspaceName,
  role,
  canEditWorkspace,
  canLeaveWorkspace,
}: WorkspaceSettingsProps) {
  if (!workspaceName || !role) {
    return (
      <SettingsSection
        title="Workspace"
        description="Settings for the workspace you currently have selected."
      >
        <p className="text-sm text-base-content/60">
          You are not a member of any workspace yet.
        </p>
      </SettingsSection>
    );
  }

  return (
    <>
      <SettingsSection
        title="Workspace"
        description="Settings for the workspace you currently have selected."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-base-content/50">Your role</span>
          <span className="badge badge-primary capitalize">
            {role.toLowerCase()}
          </span>
        </div>

        {canEditWorkspace ? (
          <WorkspaceNameForm workspaceName={workspaceName} />
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-base-content">
                Workspace name
              </p>
              <p className="mt-1 break-words text-sm text-base-content/60">
                {workspaceName}
              </p>
            </div>
            <p className="rounded-lg border border-base-200 bg-base-200/40 px-3 py-2 text-sm text-base-content/60">
              You don&apos;t have permission to modify workspace settings.
            </p>
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Leave Workspace"
        description="Remove yourself from this workspace and revoke your access to its projects and resources."
        danger
      >
        <LeaveWorkspace canLeave={canLeaveWorkspace} />
      </SettingsSection>
    </>
  );
}