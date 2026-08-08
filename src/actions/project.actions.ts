"use server";

import { projectSchema } from "../schemas/project.schema";
import { prisma } from "../lib/prisma";

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

  return {
    success: true,
    error: null,
  };
}