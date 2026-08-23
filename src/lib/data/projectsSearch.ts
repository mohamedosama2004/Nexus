import { prisma } from "../prisma";
import { getCurrentUser } from "../auth";
import { getCurrentWorkspace } from "../current-workspace";

import {
  getProjectsPaginated,
  type ProjectStatus,
} from "./projects";

type GetProjectsBySearchOptions = {
  query?: string;
  status?: ProjectStatus;
  sort?: string;
  page?: number;
};

export async function getProjectsBySearch({
  query,
  status,
  sort,
  page,
}: GetProjectsBySearchOptions) {
  return getProjectsPaginated({ query, status, sort, page });
}

export type ProjectTaskStats = {
  total: number;
  completed: number;
};

export async function getProjectTaskStats(): Promise<
  Map<string, ProjectTaskStats>
> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return new Map();
  }

  const grouped = await prisma.task.groupBy({
    by: ["projectId", "status"],
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
    _count: {
      _all: true,
    },
  });

  const stats = new Map<string, ProjectTaskStats>();

  for (const row of grouped) {
    const entry = stats.get(row.projectId) ?? { total: 0, completed: 0 };

    entry.total += row._count._all;

    if (row.status.toLowerCase() === "completed") {
      entry.completed += row._count._all;
    }

    stats.set(row.projectId, entry);
  }

  return stats;
}
