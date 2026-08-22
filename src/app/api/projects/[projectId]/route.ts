import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

import { requireProjectPermission } from "../../../../lib/authorization";

import { updateProjectSchema } from "@/src/schemas/project.schema";
import { apiError } from "@/src/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId: id } = await params;

  const permission = await requireProjectPermission(id, "VIEW_PROJECT");

  if (!permission.authorized) {
    return apiError(permission.error ?? "Unauthorized", 403);
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return apiError("Project not found.", 404);
    }

    return NextResponse.json({
      project,
    });
  } catch (error) {
    console.error("Failed to get project:", error);
    return apiError("Failed to get project.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId: id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body.", 400);
  }
  if (typeof body !== "object" || body === null) {
    return apiError("Invalid JSON body.", 400);
  }
  const result = updateProjectSchema.safeParse({
    ...body,
    id,
  });

  if (!result.success) {
    return apiError("invalid project data", 400, result.error.flatten());
  }

  const permission = await requireProjectPermission(id, "UPDATE_PROJECT");

  if (!permission.authorized) {
    return apiError(permission.error ?? "Unathorized", 403);
  }

  const { projectName, description, status } = result.data;

  try {
    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        title: projectName,
        description,
        status,
      },
    });

    return NextResponse.json({
      project,
    });
  } catch (error) {
    console.error("Failed to update project:", error);
    return apiError("Failed to update project.", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId: id } = await params;

  const permission = await requireProjectPermission(id, "DELETE_PROJECT");

  if (!permission.authorized) {
    return apiError(permission.error ?? "Unathorized", 403);
  }

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    return apiError("Project not found.", 404);
  }

  try {
    await prisma.project.delete({
      where: {
        id,
      },
    });
    return NextResponse.json(
      {
        message: "Project deleted succssfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Failed to delete project:", error);

    return apiError("Failed to delete project.", 500);
  }
}
