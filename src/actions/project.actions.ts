"use server";

import {
  projectSchema,
  updateProjectSchema,
} from "../schemas/project.schema";

import { prisma } from "../lib/prisma";

import {
  requireProjectPermission,
} from "../lib/authorization";

import { ProjectRole } from "../generated/prisma/enums";

import { cookies } from "next/headers";

import { revalidatePath } from "next/cache";

// ✅ NEW: Get the workspace selected by the current user
import { getCurrentWorkspace } from "../lib/current-workspace";

export type ProjectActionState = {
  success: boolean;
  error: string | null;
};

export async function createProject(
  prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const data = {
    projectName: formData.get("projectName"),
    description: formData.get("description"),
    status: formData.get("status"),
  };

  const result = projectSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return {
      success: false,
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
      success: false,
      error: "Your session is invalid or expired.",
    };
  }

  // ❌ OLD:
  // const workspace = await prisma.workspace.findFirst();
  //
  // This was wrong because it simply returned the first
  // workspace in the database, not the workspace selected
  // by the current user.

  // ✅ NEW:
  // Get the workspace currently selected by the user.
  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return {
      success: false,
      error: "No current workspace found.",
    };
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.userId,
        workspaceId: currentWorkspace.workspace.id,
      },
    },
  });

  if (!membership) {
    return {
      success: false,
      error: "You are not a member of this workspace.",
    };
  }

  const resultTransaction = await prisma.$transaction(
    async (tx) => {
      const project = await tx.project.create({
        data: {
          title: result.data.projectName,
          description: result.data.description,
          status: result.data.status,

          // ✅ NEW:
          // Create the project inside the current workspace.
          workspaceId: currentWorkspace.workspace.id,
        },
      });

      await tx.projectMember.create({
        data: {
          userId: session.userId,
          projectId: project.id,
          role: ProjectRole.OWNER,
        },
      });

      return project;
    },
  );

  revalidatePath("/projects");

  return {
    success: true,
    error: null,
  };
}

export async function updateProject(
  prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const data = {
    id: formData.get("id"),
    projectName: formData.get("projectName"),
    description: formData.get("description"),
    status: formData.get("status"),
  };

  const result = updateProjectSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const project = await prisma.project.findUnique({
    where: {
      id: result.data.id,
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!project) {
    return {
      success: false,
      error: "Project not found.",
    };
  }

  const authorization = await requireProjectPermission(
    result.data.id,
    "UPDATE_PROJECT",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error ?? "Unauthorized.",
    };
  }

  await prisma.project.update({
    where: {
      id: result.data.id,
    },
    data: {
      title: result.data.projectName,
      description: result.data.description,
      status: result.data.status,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${result.data.id}`);

  return {
    success: true,
    error: null,
  };
}

export async function deleteProject(
  prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const id = formData.get("id");

  if (!id || typeof id !== "string") {
    return {
      success: false,
      error: "Project ID is required.",
    };
  }

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!project) {
    return {
      success: false,
      error: "Project not found.",
    };
  }

  const authorization = await requireProjectPermission(
    project.id,
    "DELETE_PROJECT",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error ?? "Unauthorized.",
    };
  }

  await prisma.project.delete({
    where: {
      id,
    },
  });

  revalidatePath("/projects");

  return {
    success: true,
    error: null,
  };
}