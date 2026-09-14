"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";
import { getCurrentWorkspace } from "../lib/current-workspace";
import { requireWorkspacePermission } from "../lib/authorization";
import {
  changePasswordSchema,
  updateWorkspaceSchema,
} from "../schemas/settings.schema";
import {
  RATE_LIMIT_EXCEEDED_MESSAGE,
  consumeRateLimit,
} from "../lib/rate-limit";

export type SettingsActionState = {
  success: boolean;
  error: string | null;
};

/**
 * Updates the name of the workspace currently selected by the user.
 *
 * Authorization is enforced server-side: only OWNER and ADMIN roles carry the
 * `UPDATE_WORKSPACE` permission (see lib/authorization.ts).
 */
export async function updateWorkspace(
  prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const result = updateWorkspaceSchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return {
      success: false,
      error: "You are not a member of any workspace.",
    };
  }

  const authorization = await requireWorkspacePermission(
    currentWorkspace.workspace.id,
    "UPDATE_WORKSPACE",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error ?? "Unauthorized.",
    };
  }

  await prisma.workspace.update({
    where: {
      id: currentWorkspace.workspace.id,
    },
    data: {
      name: result.data.name,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/", "layout");

  return {
    success: true,
    error: null,
  };
}

/**
 * Removes the current user's Membership for the currently selected workspace.
 *
 * Only the caller's own membership is deleted — the user, the workspace, its
 * projects, tasks, and other members are left untouched.
 *
 * Owner safety: a workspace owner is blocked from leaving when doing so would
 * leave the workspace without any owner. Ownership transfer is intentionally
 * out of scope, so the owner is told to transfer ownership instead.
 */
export async function leaveWorkspace(
  _prevState: SettingsActionState,
  _formData: FormData,
): Promise<SettingsActionState> {
  void _prevState;
  void _formData;

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const currentWorkspace = await getCurrentWorkspace();

  if (!currentWorkspace) {
    return {
      success: false,
      error: "You are not a member of any workspace.",
    };
  }

  const workspaceId = currentWorkspace.workspace.id;

  // Re-fetch the membership for the current request instead of trusting the
  // workspace context alone: the membership is the authority here.
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: currentUser.id,
        workspaceId,
      },
    },
  });

  if (!membership) {
    return {
      success: false,
      error: "You are not a member of this workspace.",
    };
  }

  if (membership.role === "OWNER") {
    const ownerCount = await prisma.membership.count({
      where: {
        workspaceId,
        role: "OWNER",
      },
    });

    if (ownerCount <= 1) {
      return {
        success: false,
        error:
          "Workspace owners cannot leave the workspace. Transfer ownership before leaving.",
      };
    }
  }

  await prisma.membership.delete({
    where: {
      userId_workspaceId: {
        userId: currentUser.id,
        workspaceId,
      },
    },
  });

  // The current workspace selection must not keep pointing at a workspace the
  // user can no longer access. Clearing it lets getCurrentWorkspace fall back
  // to the user's first remaining workspace (or "no workspace" if none).
  const cookieStore = await cookies();
  cookieStore.delete("current_workspace_id");

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");

  return {
    success: true,
    error: null,
  };
}

/**
 * Changes the current user's password.
 *
 * Flow: authenticate → rate limit → validate → verify the current password →
 * hash the new password → update `User.passwordHash` → invalidate every other
 * active session (keeping the current one) → revalidate.
 *
 * Accounts without a password (created via OAuth) are refused rather than
 * silently implying they have a password to verify.
 */
export async function changePassword(
  prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const result = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const rateLimit = await consumeRateLimit(
    `password-change:${currentUser.id}`,
    "passwordChange",
  );

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: RATE_LIMIT_EXCEEDED_MESSAGE,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      passwordHash: true,
    },
  });

  if (!user) {
    return {
      success: false,
      error: "Account not found.",
    };
  }

  if (!user.passwordHash) {
    return {
      success: false,
      error: "Password changes are unavailable for accounts that don't have a password.",
    };
  }

  const currentPasswordMatches = await bcrypt.compare(
    result.data.currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordMatches) {
    return {
      success: false,
      error: "Current password is incorrect.",
    };
  }

  const newPasswordHash = await bcrypt.hash(result.data.newPassword, 10);

  const cookieStore = await cookies();
  const currentSessionToken = cookieStore.get("session_token")?.value;

  // Invalidate every active session except the one driving this request, so a
  // stolen or stale session cannot survive a password rotation while the
  // current user stays signed in.
  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        passwordHash: newPasswordHash,
      },
    }),
    prisma.session.deleteMany({
      where: {
        userId: currentUser.id,
        ...(currentSessionToken
          ? { token: { not: currentSessionToken } }
          : {}),
      },
    }),
  ]);

  revalidatePath("/settings");

  return {
    success: true,
    error: null,
  };
}