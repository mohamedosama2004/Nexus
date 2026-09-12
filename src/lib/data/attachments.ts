import { prisma } from "../prisma";
import { getCurrentUser } from "../auth";
import { getCurrentWorkspace } from "../current-workspace";

export type WorkspaceAttachment = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  createdAt: Date;
  task: {
    id: string;
    title: string;
    project: {
      id: string;
      title: string;
    };
  } | null;
};

/**
 * Returns the real task attachments belonging to the current user's workspace.
 *
 * A single query joins FileRecord → Task → Project so the workspace scope
 * and every row's task/project context arrive in one round-trip (no N+1).
 * The metadata (storageKey) is exactly what TaskAttachmentModal and the
 * secure route handler use, so the dashboard grid can link straight to
 * /api/files/<storageKey>.
 */
export async function getAttachments(): Promise<WorkspaceAttachment[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return [];
  }

  const attachments = await prisma.fileRecord.findMany({
    where: {
      category: "ATTACHMENT",
      task: {
        project: {
          workspaceId: currentWorkspace.workspace.id,
        },
      },
    },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      size: true,
      storageKey: true,
      createdAt: true,
      task: {
        select: {
          id: true,
          title: true,
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return attachments;
}