import { z } from "zod";

const taskStatuses = ["active", "completed", "TODO"] as const;

const optionalDate = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return value;
  },
  z.coerce.date().optional(),
);

export const taskSchema = z
  .object({
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

    startDate: optionalDate,

    dueDate: optionalDate,
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.dueDate) {
        return true;
      }

      return data.startDate <= data.dueDate;
    },
    {
      message: "Due date must be on or after the start date.",
      path: ["dueDate"],
    },
  );

export const updateTaskSchema = taskSchema.extend({
  id: z.string().min(1, "Task ID is required."),
});
