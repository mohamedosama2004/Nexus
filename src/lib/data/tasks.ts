import { prisma } from "../prisma";
import { getCurrentUser } from "../auth";
import { getCurrentWorkspace } from "../current-workspace";

export async function getTasks() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return [];
  }

  const tasks = await prisma.task.findMany({
    where: {
      project: {
        workspaceId: currentWorkspace.workspace.id,
        members: {
          some: {
            userId: currentUser.id,
          },
        },
      },
    },
  });

  return tasks;
}
