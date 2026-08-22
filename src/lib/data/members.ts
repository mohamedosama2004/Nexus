import { prisma } from "../prisma";
import { getCurrentWorkspace } from "../current-workspace";

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
};

export async function getUsers(): Promise<WorkspaceMember[]> {
  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return [];
  }

  const members = await prisma.membership.findMany({
    where: {
      workspaceId: currentWorkspace.workspace.id,
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
  }));
}
