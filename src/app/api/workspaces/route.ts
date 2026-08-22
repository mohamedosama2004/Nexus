import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { apiError } from "../../../lib/api-response";
import { getCurrentWorkspace } from "../../../lib/current-workspace";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    const memberships =
      await prisma.membership.findMany({
        where: {
          userId: currentUser.id,
        },
        include: {
          workspace: true,
        },
        orderBy: {
          workspace: {
            createdAt: "asc",
          },
        },
      });

    const currentWorkspace =
      await getCurrentWorkspace();

    return NextResponse.json({
      workspaces: memberships.map(
        (membership) => ({
          id: membership.workspace.id,
          name: membership.workspace.name,
          role: membership.role,
        })
      ),
      currentWorkspace:
        currentWorkspace?.workspace.id ?? null,
    });
  } catch (error) {
    console.error(
      "Get workspaces error:",
      error
    );

    return apiError(
      "Internal server error",
      500
    );
  }
}