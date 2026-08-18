import { z } from "zod";

const taskStatuses = ["active", "completed", "TODO"] as const;

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Task title must be at least 3 characters.")
    .max(100, "Task title must not exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters."),

  status: z.enum(taskStatuses),

  projectId: z.string().min(1, "Project is required."),
});

export const updateTaskSchema = taskSchema.extend({
  id: z.string().min(1, "Task ID is required."),
});