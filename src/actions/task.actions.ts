"use server";

import { taskSchema } from "../schemas/task.schema";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export type TaskActionState = {
  success: boolean;
  error: string | null;
};

export async function createTask(
  prevState: TaskActionState,
  formData: FormData,
) {
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    projectId: formData.get("projectId"),
  };

  const result = taskSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  await prisma.task.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      projectId: result.data.projectId,
    },
  });

  revalidatePath(`/projects/${result.data.projectId}`);

  return {
    success: true,
    error: null,
  };
}
