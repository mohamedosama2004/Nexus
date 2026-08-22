import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { apiError } from "@/src/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("You must be logged in.", 401);
    }

    // 2. Get project ID
    const { projectId } = await params;

    // 3. Check that the current user is a member of the project
    const currentProjectMember =
      await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: currentUser.id,
            projectId,
          },
        },
      });

    if (!currentProjectMember) {
      return apiError(
        "You are not a member of this project.",
        403,
      );
    }

    // 4. Get project members
    const members = await prisma.projectMember.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 5. Return members
    return NextResponse.json({
      members,
    });
  } catch (error) {
    console.error(
      "Failed to get project members:",
      error,
    );

    return apiError(
      "Failed to get project members.",
      500,
    );
  }
}