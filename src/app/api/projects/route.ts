import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { requireWorkspacePermission } from "@/src/lib/authorization";
import { projectSchema } from "@/src/schemas/project.schema";

// read projects
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  //! check the Workspace to get users particpating in it

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId is Required" },
      { status: 400 },
    );
  }

  // ! getting the current signed in user
  const user = await getCurrentUser();
  // ! Checking if the user is logged in or not
  if (!user) {
    return NextResponse.json(
      { error: "you must be Logged in" },
      { status: 401 },
    );
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
    return NextResponse.json(
      { error: "You are not a member of this workspace." },
      { status: 403 },
    );
  }
  // ! if workspace exist && user is a memeber in the workspace

  //! <-- get all the projects of the selected workspace that the user is a member in it -->
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
  return NextResponse.json({
    projects,
  });
}

// create projects

export async function POST(request: Request) {
  const body = await request.json();
  const result = projectSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "invalid Project data",
        issues: result.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }
  const { projectName, description, status } = result.data;
  const { searchParams } = new URL(request.url);

  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId is required." },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in." },
      { status: 401 },
    );
  }

  const permission = await requireWorkspacePermission(
    workspaceId,
    "CREATE_PROJECT",
  );

  if (!permission.authorized) {
    return NextResponse.json({ error: permission.error }, { status: 403 });
  }

  const project = await prisma.project.create({
    data: {
      title: projectName,
      description,
      status,
      workspaceId,
    },
  });
  return NextResponse.json({ project }, { status: 201 });
}
