import { prisma } from "../prisma";

export async function getProjects() {
  const projects = await prisma.project.findMany({
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
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      tasks: true,
    },
  });

  return project;
}
