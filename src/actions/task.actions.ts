"use server";

import { taskSchema, updateTaskSchema } from "../schemas/task.schema";

import { prisma } from "../lib/prisma";

import { revalidatePath } from "next/cache";

import { requireProjectPermission } from "../lib/authorization";
import { getCurrentUser } from "../lib/auth";

export type TaskActionState = {
  success: boolean;
  error: string | null;
};

const TASK_STATUSES = ["TODO", "active", "completed"] as const;

export async function setTaskStatus(
  taskId: string,
  status: string,
): Promise<TaskActionState> {
  if (!(TASK_STATUSES as readonly string[]).includes(status)) {
    return {
      success: false,
      error: "Invalid task status.",
    };
  }

  const currentUser = await getCurrentUser();

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      projectId: true,
    },
  });

  if (!currentUser || !task) {
    return {
      success: false,
      error: "Task not found.",
    };
  }

  const authorization = await requireProjectPermission(
    task.projectId,
    "UPDATE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error ?? "Unauthorized.",
    };
  }

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status,
    },
  });

  revalidatePath(`/projects/${task.projectId}`);

  return {
    success: true,
    error: null,
  };
}

export async function createTask(
  prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    projectId: formData.get("projectId"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  };

  const result = taskSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const authorization = await requireProjectPermission(
    result.data.projectId,
    "CREATE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error,
    };
  }

  await prisma.task.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      projectId: result.data.projectId,
      startDate: result.data.startDate,
      dueDate: result.data.dueDate,
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
): Promise<TaskActionState> {
  const data = {
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    projectId: formData.get("projectId"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
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

  const authorization = await requireProjectPermission(
    task.projectId,
    "UPDATE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error,
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
      startDate: result.data.startDate,
      dueDate: result.data.dueDate,
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
): Promise<TaskActionState> {
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
    where: {
      id,
    },
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

  const authorization = await requireProjectPermission(
    existing.projectId,
    "DELETE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error,
    };
  }

  await prisma.task.delete({
    where: {
      id,
    },
  });

  revalidatePath(`/projects/${existing.projectId}`);

  return {
    success: true,
    error: null,
  };
}
