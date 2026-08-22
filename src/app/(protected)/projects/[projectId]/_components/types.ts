import type { Prisma } from "@/src/generated/prisma/client";

export type ProjectWithMembersAndTasks = Prisma.ProjectGetPayload<{
  include: {
    tasks: true;
    members: {
      select: {
        id: true;
        role: true;
        user: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type ProjectMemberWithUser =
  ProjectWithMembersAndTasks["members"][number];

export type ProjectTask = ProjectWithMembersAndTasks["tasks"][number];
