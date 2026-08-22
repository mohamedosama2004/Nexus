import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";

import { getCurrentUser } from "../../../lib/auth";

import { apiError } from "../../../lib/api-response";

export async function GET() {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    // 2. Get current user's notifications
    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: currentUser.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          readAt: true,
          createdAt: true,
          invitationId: true,
          invitation: {
            select: {
              status: true,
              projectId: true,
            },
          },
        },
      });

    // 3. Calculate unread count
    const unreadCount =
      notifications.filter(
        (notification) =>
          notification.readAt === null
      ).length;

    // 4. Success response
    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return apiError(
      "Internal server error",
      500
    );
  }
}