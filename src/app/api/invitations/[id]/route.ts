import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

import { getCurrentUser } from "../../../../lib/auth";

import { apiError } from "../../../../lib/api-response";


export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    // 2. Get invitation ID
    const { id } = await params;

    // 3. Read request body
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body.", 400);
    }

    // 4. Validate action
    const action =
      typeof body === "object" &&
      body !== null &&
      "action" in body &&
      typeof body.action === "string"
        ? body.action
        : null;

    if (action !== "ACCEPT" && action !== "DECLINE") {
      return apiError(
        "Action must be ACCEPT or DECLINE.",
        400,
      );
    }

    // 5. Find invitation for the current user
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        inviteeId: currentUser.id,
      },
    });

    if (!invitation) {
      return apiError("Invitation not found.", 404);
    }

    // 6. Check invitation status
    if (invitation.status !== "PENDING") {
      return apiError(
        "Invitation is no longer pending.",
        409,
      );
    }

    // 7. Check invitation expiration
    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: "EXPIRED",
        },
      });

      return apiError("Invitation has expired.", 410);
    }

    // =========================================================
    // 8. DECLINE INVITATION
    // =========================================================

    if (action === "DECLINE") {
      const updatedInvitation =
        await prisma.invitation.update({
          where: {
            id: invitation.id,
          },
          data: {
            status: "DECLINED",
          },
        });

      return NextResponse.json({
        invitation: {
          id: updatedInvitation.id,
          status: updatedInvitation.status,
        },
      });
    }

    // =========================================================
    // 9. ACCEPT PROJECT INVITATION
    // =========================================================

    if (invitation.projectId !== null) {
      // Project invitation must have a project role
      if (invitation.projectRole === null) {
        return apiError(
          "Project invitation has no project role.",
          400,
        );
      }

      const projectId = invitation.projectId;
      const projectRole = invitation.projectRole;

      const result = await prisma.$transaction(async (tx) => {
        const existingProjectMember =
          await tx.projectMember.findUnique({
            where: {
              userId_projectId: {
                userId: currentUser.id,
                projectId,
              },
            },
          });

        if (existingProjectMember) {
          throw new Error(
            "User is already a member of this project.",
          );
        }

        const projectMember =
          await tx.projectMember.create({
            data: {
              userId: currentUser.id,
              projectId,
              role: projectRole,
            },
          });

        const updatedInvitation =
          await tx.invitation.update({
            where: {
              id: invitation.id,
            },
            data: {
              status: "ACCEPTED",
            },
          });

        return {
          projectMember,
          invitation: updatedInvitation,
        };
      });

      return NextResponse.json({
        invitation: {
          id: result.invitation.id,
          status: result.invitation.status,
        },
        projectMember: {
          id: result.projectMember.id,
          projectId: result.projectMember.projectId,
          role: result.projectMember.role,
        },
      });
    }

    // =========================================================
    // 10. ACCEPT WORKSPACE INVITATION
    // =========================================================

    if (invitation.role === null) {
      return apiError(
        "Workspace invitation has no workspace role.",
        400,
      );
    }

    const workspaceRole = invitation.role;

    const result = await prisma.$transaction(async (tx) => {
      const existingMembership =
        await tx.membership.findUnique({
          where: {
            userId_workspaceId: {
              userId: currentUser.id,
              workspaceId: invitation.workspaceId,
            },
          },
        });

      if (existingMembership) {
        throw new Error(
          "User is already a member of this workspace.",
        );
      }

      const membership = await tx.membership.create({
        data: {
          userId: currentUser.id,
          workspaceId: invitation.workspaceId,
          role: workspaceRole,
        },
      });

      const updatedInvitation =
        await tx.invitation.update({
          where: {
            id: invitation.id,
          },
          data: {
            status: "ACCEPTED",
          },
        });

      return {
        membership,
        invitation: updatedInvitation,
      };
    });

    // 11. Success response
    return NextResponse.json({
      invitation: {
        id: result.invitation.id,
        status: result.invitation.status,
      },
      membership: {
        id: result.membership.id,
        workspaceId: result.membership.workspaceId,
        role: result.membership.role,
      },
    });
  } catch (error) {
    console.error("Update invitation error:", error);

    if (
      error instanceof Error &&
      error.message ===
        "User is already a member of this project."
    ) {
      return apiError(error.message, 409);
    }

    if (
      error instanceof Error &&
      error.message ===
        "User is already a member of this workspace."
    ) {
      return apiError(error.message, 409);
    }

    return apiError("Internal server error.", 500);
  }
}