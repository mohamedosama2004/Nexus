import { cookies } from "next/headers";

import { prisma } from "./prisma";

import { ProjectRole, Role } from "../generated/prisma/enums";

type workspacePermission =
  | "CREATE_PROJECT"
  | "UPDATE_PROJECT"
  | "DELETE_PROJECT"
  | "CREATE_TASK"
  | "UPDATE_TASK"
  | "DELETE_TASK"
  | "INVITE_MEMBER";

const workspaceRolePermissions: Record<Role, workspacePermission[]> = {
  OWNER: [
    "CREATE_PROJECT",
    "UPDATE_PROJECT",
    "DELETE_PROJECT",
    "CREATE_TASK",
    "UPDATE_TASK",
    "DELETE_TASK",
    "INVITE_MEMBER",
  ],

  ADMIN: [
    "CREATE_PROJECT",
    "UPDATE_PROJECT",
    "DELETE_PROJECT",
    "CREATE_TASK",
    "UPDATE_TASK",
    "DELETE_TASK",
    "INVITE_MEMBER",
  ],

  MEMBER: ["CREATE_TASK", "UPDATE_TASK"],
};

function hasWorkspacePermission(
  role: Role,
  permission: workspacePermission
) {
  return workspaceRolePermissions[role].includes(permission);
}

export async function requireWorkspacePermission(
  workspaceId: string,
  permission: workspacePermission
) {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return {
      authorized: false,
      error: "You must be logged in.",
    };
  }

  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return {
      authorized: false,
      error: "Your session is invalid or expired.",
    };
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.userId,
        workspaceId,
      },
    },
  });

  if (!membership) {
    return {
      authorized: false,
      error: "You are not a member of this workspace.",
    };
  }

  if (!hasWorkspacePermission(membership.role, permission)) {
    return {
      authorized: false,
      error: "You are not authorized to perform this action.",
    };
  }

  return {
    authorized: true,
    error: null,
    membership,
  };
}

type projectPermission =
  | "VIEW_PROJECT"
  | "UPDATE_PROJECT"
  | "DELETE_PROJECT"
  | "CREATE_TASK"
  | "UPDATE_TASK"
  | "DELETE_TASK"
  | "MANAGE_PROJECT_MEMBERS";

const projectRolePermissions: Record<ProjectRole, projectPermission[]> = {
  OWNER: [
    "VIEW_PROJECT",
    "UPDATE_PROJECT",
    "DELETE_PROJECT",
    "CREATE_TASK",
    "UPDATE_TASK",
    "DELETE_TASK",
    "MANAGE_PROJECT_MEMBERS",
  ],

  MEMBER: [
    "VIEW_PROJECT",
    "CREATE_TASK",
    "UPDATE_TASK",
  ],
};

function hasProjectPermission(
  role: ProjectRole,
  permission: projectPermission
) {
  return projectRolePermissions[role].includes(permission);
}

export async function requireProjectPermission(
  projectId: string,
  permission: projectPermission
) {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return {
      authorized: false,
      error: "You must be logged in.",
    };
  }

  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return {
      authorized: false,
      error: "Your session is invalid or expired.",
    };
  }

  const projectMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: session.userId,
        projectId,
      },
    },
  });

  if (!projectMember) {
    return {
      authorized: false,
      error: "You are not a member of this project.",
    };
  }

  if (!hasProjectPermission(projectMember.role, permission)) {
    return {
      authorized: false,
      error: "You are not authorized to perform this action.",
    };
  }

  return {
    authorized: true,
    error: null,
    projectMember,
  };
}