import type { Prisma } from "@/src/generated/prisma/client";

export type ProjectWithTasks = Prisma.ProjectGetPayload<{
  include: { tasks: true };
}>;
