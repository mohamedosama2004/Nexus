import { cookies } from "next/headers";

import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";

export async function getCurrentWorkspace() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const cookieStore = await cookies();

  const workspaceId = cookieStore.get("current_workspace_id")?.value;

  const memberships = await prisma.membership.findMany({
    where: {
      userId: currentUser.id,
    },
    include: {
      workspace: true,
    },
  });

  if (memberships.length === 0) {
    return null;
  }

  // If a workspace is already selected,
  // make sure the user is actually a member of it.
  if (workspaceId) {
    const currentMembership = memberships.find(
      (membership) => membership.workspaceId === workspaceId,
    );

    if (currentMembership) {
      return {
        workspace: currentMembership.workspace,
        membership: currentMembership,
      };
    }
  }

  // If there is no valid selected workspace,
  // use the first workspace.
  return {
    workspace: memberships[0].workspace,
    membership: memberships[0],
  };
}
