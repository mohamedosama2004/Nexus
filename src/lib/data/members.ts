import { prisma } from "../prisma";
import { getCurrentWorkspace } from "../current-workspace";

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  avatarFile: { storageKey: string } | null;
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
          avatarFile: {
            select: {
              storageKey: true,
            },
          },
        },
      },
    },
  });

  return members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    avatarFile: member.user.avatarFile,
  }));
}
