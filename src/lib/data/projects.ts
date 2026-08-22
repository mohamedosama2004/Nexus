import { cookies } from "next/headers";

import { prisma } from "../prisma";
import { getCurrentWorkspace } from "../current-workspace";

export async function getProjects() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return [];
  }

  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return [];
  }

  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return [];
  }

  const projects = await prisma.project.findMany({
    where: {
      workspaceId: currentWorkspace.workspace.id,
      members: {
        some: {
          userId: session.userId,
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  return projects;
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