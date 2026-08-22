import { NextResponse } from "next/server";

import { prisma } from "../../../../../lib/prisma";

import { getCurrentUser } from "../../../../../lib/auth";

import { apiError } from "../../../../../lib/api-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    // 2. Get notification ID
    const { id } = await params;

    // 3. Find notification belonging to current user
    const notification =
      await prisma.notification.findFirst({
        where: {
          id,
          userId: currentUser.id,
        },
      });

    if (!notification) {
      return apiError(
        "Notification not found",
        404
      );
    }

    // 4. Mark notification as read
    const updatedNotification =
      await prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          readAt: new Date(),
        },
      });

    // 5. Success response
    return NextResponse.json({
      id: updatedNotification.id,
      readAt: updatedNotification.readAt,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    return apiError(
      "Internal server error",
      500
    );
  }
}