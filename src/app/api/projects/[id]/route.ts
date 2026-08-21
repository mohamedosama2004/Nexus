import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireProjectPermission } from "../../../..//lib/authorization";
import { updateProjectSchema } from "@/src/schemas/project.schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const permission = await requireProjectPermission(
    id,
    "VIEW_PROJECT"
  );

  if (!permission.authorized) {
    return NextResponse.json(
      { error: permission.error },
      { status: 403 }
    );
  }

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    project,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await request.json();

  const result = updateProjectSchema.safeParse({
    ...body,
    id,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid project data.",
        issues: result.error.flatten(),
      },
      { status: 400 }
    );
  }

  const permission = await requireProjectPermission(
    id,
    "UPDATE_PROJECT"
  );

  if (!permission.authorized) {
    return NextResponse.json(
      { error: permission.error },
      { status: 403 }
    );
  }

  const { projectName, description, status } = result.data;

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
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const permission = await requireProjectPermission(
    id,
    "DELETE_PROJECT"
  );

  if (!permission.authorized) {
    return NextResponse.json(
      { error: permission.error },
      { status: 403 }
    );
  }

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found." },
      { status: 404 }
    );
  }

  await prisma.project.delete({
    where: {
      id,
    },
  });

  return NextResponse.json(
    { message: "Project deleted successfully." },
    { status: 200 }
  );
}