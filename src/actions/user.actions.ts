"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";
import { deleteStoredFileRecord } from "../lib/data/file-records";
import {
  fileValidationErrors,
  validateFile,
} from "../lib/files/validate-file";
import { uploadPolicies } from "../lib/files/upload-policies";
import {
  buildStorageKey,
  getStorage,
  sanitizeFilename,
} from "../lib/files/storage";

export type AvatarActionState = {
  success: boolean;
  error: string | null;
};

/**
 * Uploads a new avatar for the current user.
 *
 * Flow: authenticate → validate → store bytes → persist metadata + update the
 * user → clean up the previous avatar → revalidate.
 */
export async function updateAvatar(
  prevState: AvatarActionState,
  formData: FormData,
): Promise<AvatarActionState> {
  // 1. Authentication
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  // 2. Validate the uploaded file against the avatar policy
  const validation = validateFile(formData.get("avatar"), uploadPolicies.avatar);

  if (!validation.ok) {
    return {
      success: false,
      error: fileValidationErrors[validation.error],
    };
  }

  const file = validation.file;

  // 3. Derive a safe key + display name (never trust the original path)
  const storageKey = buildStorageKey("avatar", file.type);
  const originalName = sanitizeFilename(file.name);

  let bytes: Buffer;

  try {
    bytes = Buffer.from(await file.arrayBuffer());
  } catch (error) {
    console.error("Failed to read uploaded avatar:", error);
    return {
      success: false,
      error: "Could not read the selected file.",
    };
  }

  // 4. Store the bytes
  try {
    await getStorage().save(storageKey, bytes);
  } catch (error) {
    console.error("Failed to store avatar:", error);
    return {
      success: false,
      error: "Could not save the uploaded file.",
    };
  }

  try {
    // 5. Persist metadata + update the user atomically
    const previous = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        avatarFile: {
          select: {
            id: true,
            storageKey: true,
          },
        },
      },
    });

    await prisma.$transaction(async (tx) => {
      const record = await tx.fileRecord.create({
        data: {
          originalName,
          mimeType: file.type,
          size: file.size,
          storageKey,
          category: "AVATAR",
          uploadedById: currentUser.id,
        },
      });

      await tx.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          avatarFileId: record.id,
        },
      });
    });

    // 6. Replace (rather than accumulate) the previous avatar
    if (previous?.avatarFile) {
      await deleteStoredFileRecord(previous.avatarFile);
    }

    // 7. Revalidate: profile page + anything rendering the top header
    revalidatePath("/dashboard/profile");
    revalidatePath("/", "layout");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    // 8. The database write failed: remove the bytes we already stored
    //    so storage is not left with an unreferenced file.
    console.error("Failed to persist avatar metadata:", error);

    try {
      await getStorage().delete(storageKey);
    } catch (cleanupError) {
      console.error("Failed to clean up avatar bytes:", cleanupError);
    }

    return {
      success: false,
      error: "Could not save your new avatar.",
    };
  }
}