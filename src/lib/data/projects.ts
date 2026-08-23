import { cookies } from "next/headers";

import { prisma } from "../prisma";

import { getCurrentWorkspace } from "../current-workspace";

import { getCurrentUser } from "../auth";

import type { Prisma } from "@/src/generated/prisma/client";

export type ProjectStatus = "active" | "completed";

type GetProjectsOptions = {
  query?: string;
  status?: ProjectStatus;
  sort?: string;
};

export const PROJECT_SORT_ORDER = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  updated: { updatedAt: "desc" },
  dueDate: { dueDate: "asc" },
  startDate: { startDate: "asc" },
} as const;

export type ProjectSortOption = keyof typeof PROJECT_SORT_ORDER;

const DEFAULT_SORT: ProjectSortOption = "newest";

export const PROJECTS_PAGE_SIZE = 12;

export function resolveProjectSort(sort?: string): ProjectSortOption {
  return sort && sort in PROJECT_SORT_ORDER
    ? (sort as ProjectSortOption)
    : DEFAULT_SORT;
}

function resolveOrderBy(
  sort?: string,
): Prisma.ProjectOrderByWithRelationInput[] {
  return [PROJECT_SORT_ORDER[resolveProjectSort(sort)], { createdAt: "desc" }];
}

async function getAuthorizedWorkspaceContext() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return null;
  }

  return {
    userId: currentUser.id,
    workspaceId: currentWorkspace.workspace.id,
  };
}

function buildAuthorizedProjectsWhere(
  { userId, workspaceId }: { userId: string; workspaceId: string },
  query?: string,
  status?: ProjectStatus,
) {
  const normalizedQuery = query?.trim();

  return {
    workspaceId,

    members: {
      some: {
        userId,
      },
    },

    ...(normalizedQuery
      ? {
          title: {
            contains: normalizedQuery,
            mode: "insensitive" as const,
          },
        }
      : {}),

    ...(status
      ? {
          status: status === "active" ? ("Active" as const) : ("Completed" as const),
        }
      : {}),
  };
}

const PROJECT_INCLUDE = {
  members: {
    select: {
      id: true,
      role: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },

  _count: {
    select: {
      tasks: true,
    },
  },
} satisfies Prisma.ProjectInclude;

export type ProjectWithMembers = Awaited<
  ReturnType<typeof getProjects>
>[number];

export async function getProjects({
  query,
  status,
  sort,
}: GetProjectsOptions = {}) {
  const context = await getAuthorizedWorkspaceContext();

  if (!context) {
    return [];
  }

  const projects = await prisma.project.findMany({
    where: buildAuthorizedProjectsWhere(context, query, status),
    include: PROJECT_INCLUDE,
    orderBy: resolveOrderBy(sort),
  });

  return projects;
}

export type PaginatedProjects = {
  projects: ProjectWithMembers[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export async function getProjectsPaginated({
  query,
  status,
  sort,
  page = 1,
}: GetProjectsOptions & { page?: number }): Promise<PaginatedProjects> {
  const context = await getAuthorizedWorkspaceContext();

  if (!context) {
    return {
      projects: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: PROJECTS_PAGE_SIZE,
    };
  }

  const where = buildAuthorizedProjectsWhere(context, query, status);

  const totalCount = await prisma.project.count({ where });

  if (totalCount === 0) {
    return {
      projects: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: PROJECTS_PAGE_SIZE,
    };
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PROJECTS_PAGE_SIZE));

  const requestedPage = Number.isFinite(page) ? Math.trunc(page) : 1;

  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const projects = await prisma.project.findMany({
    where,
    include: PROJECT_INCLUDE,
    orderBy: resolveOrderBy(sort),
    skip: (currentPage - 1) * PROJECTS_PAGE_SIZE,
    take: PROJECTS_PAGE_SIZE,
  });

  return {
    projects,
    totalCount,
    totalPages,
    currentPage,
    pageSize: PROJECTS_PAGE_SIZE,
  };
}

export async function getProjectById(projectId: string) {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: currentWorkspace.workspace.id,

      members: {
        some: {
          userId: session.userId,
        },
      },
    },

    include: {
      tasks: true,

      members: {
        select: {
          id: true,
          role: true,

          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return project;
}
