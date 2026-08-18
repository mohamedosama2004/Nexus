"use server";

import { taskSchema, updateTaskSchema } from "../schemas/task.schema";
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

export async function updateTask(
  prevState: TaskActionState,
  formData: FormData,
) {
  const data = {
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    projectId: formData.get("projectId"),
  };

  const result = updateTaskSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const task = await prisma.task.findUnique({
    where: {
      id: result.data.id,
    },
    select: {
      projectId: true,
    },
  });

  if (!task) {
    return {
      success: false,
      error: "Task not found.",
    };
  }

  await prisma.task.update({
    where: {
      id: result.data.id,
    },
    data: {
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
    },
  });

  revalidatePath(`/projects/${task.projectId}`);

  return {
    success: true,
    error: null,
  };
}

export async function deleteTask(
  prevState: TaskActionState,
  formData: FormData,
) {
  const id = formData.get("id");
  const projectId = formData.get("projectId");

  if (!id || typeof id !== "string") {
    return {
      success: false,
      error: "Task ID is required.",
    };
  }

  if (!projectId || typeof projectId !== "string") {
    return {
      success: false,
      error: "Project ID is required.",
    };
  }

 const existing = await prisma.task.findUnique({
  where: { id },
  select: {
    id: true,
    projectId: true,
  },
});

  if (!existing) {
    return {
      success: false,
      error: "Task not found.",
    };
  }

  await prisma.task.delete({
    where: { id },
  });

  revalidatePath(`/projects/${projectId}`);

  return {
    success: true,
    error: null,
  };
}
