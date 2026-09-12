import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { requireProjectPermission } from "../../../../lib/authorization";
import { apiError } from "../../../../lib/api-response";
import { getStorage } from "../../../../lib/files/storage";

/**
 * Serves stored files by storage key.
 *
 * Storage keys are opaque to the client (``/api/files/avatar/<uuid>.jpg``), so
 * this endpoint never exposes where the bytes actually live. Access is gated
 * server-side:
 *
 * - Avatars: any authenticated user may view them (they are non-sensitive).
 * - Attachments: the caller must be a member of the project the attachment
 *   belongs to (`VIEW_PROJECT`).
 *
 * Files are streamed with the MIME type recorded at upload time. We never
 * derive a Content-Type from the downloaded bytes' filename.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  try {
    const { key } = await params;

    if (key.length === 0) {
      return apiError("Not found.", 404);
    }

    const storageKey = key.join("/");

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    const file = await prisma.fileRecord.findUnique({
      where: {
        storageKey,
      },
    });

    if (!file) {
      return apiError("Not found.", 404);
    }

    // Attachments are private to the project they belong to.
    if (file.category === "ATTACHMENT") {
      if (!file.taskId) {
        return apiError("Not found.", 404);
      }

      const task = await prisma.task.findUnique({
        where: {
          id: file.taskId,
        },
        select: {
          projectId: true,
        },
      });

      if (!task) {
        return apiError("Not found.", 404);
      }

      const authorization = await requireProjectPermission(
        task.projectId,
        "VIEW_PROJECT",
      );

      if (!authorization.authorized) {
        return apiError(authorization.error ?? "Forbidden.", 403);
      }
    }

    const data = await getStorage().read(file.storageKey);

    if (!data) {
      return apiError("Not found.", 404);
    }

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(data.byteLength),
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
          file.originalName,
        )}`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (_error) {
    console.error("Serve file error:", _error);

    return apiError("Internal server error.", 500);
  }
}