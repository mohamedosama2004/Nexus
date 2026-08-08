import { z } from "zod";
const projectStatuses = ["Active", "Completed"] as const;

export const projectSchema = z.object({
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
});