import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { getCurrentWorkspace } from "@/src/lib/current-workspace";
import { hasWorkspacePermission } from "@/src/lib/authorization";

import { SettingsTabs, type SettingsTabId } from "./components/SettingsTabs";
import { WorkspaceSettings } from "./components/WorkspaceSettings";
import { SecuritySettings } from "./components/SecuritySettings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your application and workspace preferences.",
};

type Props = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // getCurrentUser() deliberately omits passwordHash, so the Security section
  // asks Prisma directly whether this account has a password to verify
  // against (accounts created via OAuth never have one).
  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  const currentWorkspace = await getCurrentWorkspace();

  const canEditWorkspace = currentWorkspace
    ? hasWorkspacePermission(currentWorkspace.membership.role, "UPDATE_WORKSPACE")
    : false;

  let canLeaveWorkspace = false;

  if (currentWorkspace) {
    const isOwner = currentWorkspace.membership.role === "OWNER";

    if (!isOwner) {
      canLeaveWorkspace = true;
    } else {
      const ownerCount = await prisma.membership.count({
        where: {
          workspaceId: currentWorkspace.workspace.id,
          role: "OWNER",
        },
      });

      canLeaveWorkspace = ownerCount > 1;
    }
  }

  const { tab } = await searchParams;
  const activeTab: SettingsTabId = tab === "security" ? "security" : "workspace";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-base-content/50">
          Manage your application and workspace preferences.
        </p>
      </header>

      <SettingsTabs activeTab={activeTab} />

      <div
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
        tabIndex={0}
        className="mt-6 space-y-5"
      >
        {activeTab === "workspace" ? (
          <WorkspaceSettings
            workspaceName={currentWorkspace?.workspace.name ?? null}
            role={currentWorkspace?.membership.role ?? null}
            canEditWorkspace={canEditWorkspace}
            canLeaveWorkspace={canLeaveWorkspace}
          />
        ) : (
          <SecuritySettings hasPassword={account?.passwordHash != null} />
        )}
      </div>
    </div>
  );
}