import { cookies } from "next/headers";
import { prisma } from "../prisma";

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
  const projects = await prisma.project.findMany({
    where: {
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
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId: session.userId,
        },
      },
    },
    include: {
      tasks: true,
    },
  });
  return project;
}
