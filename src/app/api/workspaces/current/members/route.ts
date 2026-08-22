import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { apiError } from "@/src/lib/api-response";
import { getCurrentWorkspace } from "@/src/lib/current-workspace";

export async function GET() {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("You must be logged in.", 401);
    }

    // 2. Get the currently selected workspace (from cookie)
    const currentWorkspace = await getCurrentWorkspace();

    if (!currentWorkspace) {
      return apiError(
        "You are not a member of any workspace.",
        404,
      );
    }

    // 3. Get members of the current workspace
    const members = await prisma.membership.findMany({
      where: {
        workspaceId: currentWorkspace.workspace.id,
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

    // 4. Return members
    return NextResponse.json({
      members,
    });
  } catch (error) {
    console.error(
      "Failed to get workspace members:",
      error,
    );

    return apiError(
      "Failed to get workspace members.",
      500,
    );
  }
}