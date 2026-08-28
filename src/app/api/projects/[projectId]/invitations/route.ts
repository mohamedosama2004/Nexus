import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { requireProjectPermission } from "@/src/lib/authorization";
import { apiError } from "@/src/lib/api-response";
import {
  buildInvitationUrl,
  sendProjectInvitationEmail,
} from "@/src/lib/email";

import { createProjectInvitationSchema } from "../../../../../schemas/project-invitations.schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    // 2. Get projectId from URL
    const { projectId } = await params;

    // 3. Read request body
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }

    // 4. Validate email using Zod schema
    const result = createProjectInvitationSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        "Invalid input",
        400,
        result.error.flatten(),
      );
    }

    // ✅ The email and role come from the request body
    const { email, role } = result.data;

    // 5. Check Project permission
    const authorization = await requireProjectPermission(
      projectId,
      "MANAGE_PROJECT_MEMBERS",
    );

    if (!authorization.authorized) {
      return apiError(
        authorization.error ?? "Unauthorized.",
        403,
      );
    }

    // 6. Check that the project exists
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        title: true,
        workspaceId: true,
      },
    });

    if (!project) {
      return apiError("Project not found.", 404);
    }

    // 7. Find the user by the email we received
    const invitedUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // 7.5 Only members of the project's workspace can be invited
    if (!invitedUser) {
      return apiError("User is not a member of this workspace.", 400);
    }

    const workspaceMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: invitedUser.id,
          workspaceId: project.workspaceId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!workspaceMembership) {
      return apiError("User is not a member of this workspace.", 400);
    }

    // 8. Check if the user is already a Project member
    if (invitedUser) {
      const existingMember =
        await prisma.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: invitedUser.id,
              projectId,
            },
          },
        });

      if (existingMember) {
        return apiError(
          "User is already a member of this project.",
          409,
        );
      }
    }

    // 9. Check for existing pending invitation
    const existingInvitation =
      await prisma.invitation.findFirst({
        where: {
          projectId,
          email,
          status: "PENDING",
        },
      });

    if (existingInvitation) {
      return apiError(
        "A pending invitation already exists for this project.",
        409,
      );
    }

    // 10. Generate secure token
    const rawToken = crypto
      .randomBytes(32)
      .toString("hex");

    // 11. Hash token before storing it
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 12. Create project invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,

        // Project belongs to this workspace
        workspaceId: project.workspaceId,

        // This makes it a Project Invitation
        projectId,

        invitedById: currentUser.id,
        inviteeId: invitedUser?.id ?? null,

        // Project invitation uses the selected ProjectRole
        projectRole: role,

        tokenHash,

        expiresAt: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7,
        ),
      },
    });

    // 13. Create notification if the invited user exists
    if (invitedUser) {
      await prisma.notification.create({
        data: {
          userId: invitedUser.id,
          type: "INVITATION",
          title: "Project Invitation",
          message: `${currentUser.name} invited you to join "${project.title}".`,
          invitationId: invitation.id,
        },
      });
    }

    // 13.5 Send invitation email
    try {
      await sendProjectInvitationEmail(
        invitedUser.email,
        currentUser.name,
        project.title,
        buildInvitationUrl(invitation.id),
      );
    } catch {
      // The invitation itself still succeeded and the invitee
      // received an in-app notification. Never log the token.
      console.error("Failed to send project invitation email");
    }

    // 14. Success response
    return NextResponse.json(
      {
        id: invitation.id,
        status: invitation.status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create project invitation error:",
      error,
    );

    return apiError(
      "Internal server error",
      500,
    );
  }
}