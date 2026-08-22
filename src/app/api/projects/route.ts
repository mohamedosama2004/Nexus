import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { requireWorkspacePermission } from "@/src/lib/authorization";
import { projectSchema } from "@/src/schemas/project.schema";
import { apiError } from "@/src/lib/api-response";

// read projects
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  //! check the Workspace to get users particpating in it

  if (!workspaceId) {
    return apiError("workspaceId is Required", 400);
  }

  // ! getting the current signed in user
  const user = await getCurrentUser();
  // ! Checking if the user is logged in or not
  if (!user) {
    return apiError("you must be Logged in", 401);
  }

  // ! getting the member ship
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
  });

  // ! Check if the user is a member in the Workspace
  if (!membership) {
    return apiError("You are not a member of this workspace.", 403);
  }

  // ! if workspace exist && user is a memeber in the workspace
  // ! <-- get all the projects of the selected workspace that the user is a member in it -->
  try {
    const projects = await prisma.project.findMany({
      where: {
        workspaceId,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });
    return NextResponse.json(
      {
        projects,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Failed to get project:", error);
    return apiError("Failed to GET project.", 500);
  }
}

// create projects

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return apiError("You must be logged in.", 401);
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return apiError("workspaceId is required.", 400);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body.", 400);
  }

  const result = projectSchema.safeParse(body);

  if (!result.success) {
    return apiError("Invalid project data", 400, result.error.flatten());
  }

  const permission = await requireWorkspacePermission(
    workspaceId,
    "CREATE_PROJECT",
  );

  if (!permission.authorized) {
    return apiError(permission.error ?? "Unauthorized.", 403);
  }

  try {
    const { projectName, description, status } = result.data;

    const project = await prisma.project.create({
      data: {
        title: projectName,
        description,
        status,
        workspaceId,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);

    return apiError("Failed to create project.", 500);
  }
}
