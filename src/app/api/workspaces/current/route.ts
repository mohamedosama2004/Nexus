import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { apiError } from "../../../../lib/api-response";

export async function PATCH(request: Request) {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    // 2. Read request body
    const body = await request.json();

    const { workspaceId } = body;

    if (!workspaceId) {
      return apiError("Workspace ID is required", 400);
    }

    // 3. Check workspace membership
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: currentUser.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return apiError("You are not a member of this workspace", 403);
    }

    // 4. Set current workspace cookie
    const response = NextResponse.json({
      workspaceId,
    });

    response.cookies.set("current_workspace_id", workspaceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Set current workspace error:", error);

    return apiError("Internal server error", 500);
  }
}
