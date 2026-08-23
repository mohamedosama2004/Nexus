import { z } from "zod";

const projectStatuses = ["Active", "Completed"] as const;

const optionalDate = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return value;
  },
  z.coerce.date().optional(),
);

export const projectSchema = z
  .object({
    projectName: z
      .string()
      .trim()
      .min(3, "Project name must be at least 3 characters.")
      .max(50, "Project name must not exceed 50 characters."),

    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters."),

    status: z.enum(projectStatuses),

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

export const updateProjectSchema = projectSchema.extend({
  id: z.string().min(1, "Project ID is required."),
});