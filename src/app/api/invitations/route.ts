import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { requireWorkspacePermission } from "../../../lib/authorization";
import { apiError } from "../../../lib/api-response";
import { getCurrentWorkspace } from "../../../lib/current-workspace";
import { createInvitationSchema } from "../../../schemas/invitation";
import {
  buildInvitationUrl,
  sendWorkspaceInvitationEmail,
} from "../../../lib/email";

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    // 2. Read request body
    const body = await request.json();

    // 3. Validate input
    const result = createInvitationSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        "Invalid input",
        400,
        result.error.flatten()
      );
    }

    const { email, role } = result.data;

    // workspaceId falls back to the user's current workspace
    const workspaceId =
      result.data.workspaceId ??
      (await getCurrentWorkspace())?.workspace.id;

    if (!workspaceId) {
      return apiError("Workspace ID is required", 400);
    }

    // 4. Authorization
    const authorization = await requireWorkspacePermission(
      workspaceId,
      "INVITE_MEMBER"
    );

    if (!authorization.authorized) {
      return apiError(
        authorization.error ?? "authorized",
        403
      );
    }

    // 5. Check if user already belongs to workspace
    const invitedUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (invitedUser) {
      const existingMembership =
        await prisma.membership.findUnique({
          where: {
            userId_workspaceId: {
              userId: invitedUser.id,
              workspaceId,
            },
          },
        });

      if (existingMembership) {
        return apiError(
          "User is already a member of this workspace",
          409
        );
      }
    }

    // 6. Check for existing pending invitation
    const existingInvitation =
      await prisma.invitation.findFirst({
        where: {
          workspaceId,
          email,
          status: "PENDING",
        },
      });

    if (existingInvitation) {
      return apiError(
        "A pending invitation already exists for this email",
        409
      );
    }

    // 7. Generate secure token
    const rawToken = crypto
      .randomBytes(32)
      .toString("hex");

    // 8. Hash token before storing it
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 9. Create invitation + notification
    //    inside the same transaction
    const transactionResult  = await prisma.$transaction(
      async (tx) => {
        const invitation =
          await tx.invitation.create({
            data: {
              email,
              workspaceId,
              invitedById: currentUser.id,
              inviteeId: invitedUser?.id ?? null,
              role,
              tokenHash,
              expiresAt: new Date(
                Date.now() +
                  1000 * 60 * 60 * 24 * 7
              ),
            },
          });

        let notification = null;

        // Only create an in-app notification
        // if the invited email belongs to an existing user.
        if (invitedUser) {
          notification =
            await tx.notification.create({
              data: {
                userId: invitedUser.id,
                type: "INVITATION",
                title: "Workspace Invitation",
                message:
                  `${currentUser.name} invited you to join his workspace.`,
                invitationId: invitation.id,
              },
            });
        }

        return {
          invitation,
          notification,
        };
      }
    );

    // 10. Send invitation email
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        name: true,
      },
    });

    try {
      await sendWorkspaceInvitationEmail(
        invitedUser?.email ?? email,
        currentUser.name,
        workspace?.name ?? "a workspace",
        buildInvitationUrl(transactionResult.invitation.id)
      );
    } catch {
      // The invitation itself still succeeded and the invitee
      // received an in-app notification. Never log the token.
      console.error("Failed to send workspace invitation email");
    }

    // 11. Success response
    return NextResponse.json(
      {
        id: transactionResult .invitation.id,
        status: transactionResult .invitation.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create invitation error:",
      error
    );

    return apiError(
      "Internal server error",
      500
    );
  }
}