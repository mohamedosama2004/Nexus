"use server";

import { projectSchema, updateProjectSchema } from "../schemas/project.schema";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export type ProjectActionState = {
  success: boolean;
  error: string | null;
};

export async function createProject(
  prevState: ProjectActionState,
  formData: FormData,
) {
  const data = {
    projectName: formData.get("projectName"),
    description: formData.get("description"),
    status: formData.get("status"),
  };

  const result = projectSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  // Get a workspace for this lesson/test
  const workspace = await prisma.workspace.findFirst();

  if (!workspace) {
    return {
      success: false,
      error: "No workspace found.",
    };
  }

  await prisma.project.create({
    data: {
      title: result.data.projectName,
      description: result.data.description,
      status: result.data.status,
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/projects");

  return {
    success: true,
    error: null,
  };
}

export async function updateProject(
  prevState: ProjectActionState,
  formData: FormData,
) {
  const data = {
    id: formData.get("id"),
    projectName: formData.get("projectName"),
    description: formData.get("description"),
    status: formData.get("status"),
  };

  const result = updateProjectSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  await prisma.project.update({
    where: { id: result.data.id },
    data: {
      title: result.data.projectName,
      description: result.data.description,
      status: result.data.status,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${result.data.id}`);

  return {
    success: true,
    error: null,
  };
}

export async function deleteProject(
  prevState: ProjectActionState,
  formData: FormData,
) {
  const id = formData.get("id");

  if (!id || typeof id !== "string") {
    return {
      success: false,
      error: "Project ID is required.",
    };
  }

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!project) {
    return {
      success: false,
      error: "Project not found.",
    };
  }

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/projects");

  return {
    success: true,
    error: null,
  };
}