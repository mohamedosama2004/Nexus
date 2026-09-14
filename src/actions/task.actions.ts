"use server";

import { taskSchema, updateTaskSchema } from "../schemas/task.schema";

import { prisma } from "../lib/prisma";

import { revalidatePath } from "next/cache";

import { requireProjectPermission } from "../lib/authorization";
import { getCurrentUser } from "../lib/auth";
import {
  fileValidationErrors,
  validateFile,
} from "../lib/files/validate-file";
import {
  contentValidationErrors,
  validateFileContent,
} from "../lib/files/content-validation";
import { uploadPolicies } from "../lib/files/upload-policies";
import {
  buildStorageKey,
  getStorage,
  getStorageUploadPath,
  sanitizeFilename,
} from "../lib/files/storage";
import {
  RATE_LIMIT_EXCEEDED_MESSAGE,
  consumeRateLimit,
} from "../lib/rate-limit";

export type TaskActionState = {
  success: boolean;
  error: string | null;
};

const TASK_STATUSES = ["TODO", "active", "completed"] as const;

export async function setTaskStatus(
  taskId: string,
  status: string,
): Promise<TaskActionState> {
  if (!(TASK_STATUSES as readonly string[]).includes(status)) {
    return {
      success: false,
      error: "Invalid task status.",
    };
  }

  const currentUser = await getCurrentUser();

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      projectId: true,
    },
  });

  if (!currentUser || !task) {
    return {
      success: false,
      error: "Task not found.",
    };
  }

  const authorization = await requireProjectPermission(
    task.projectId,
    "UPDATE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error ?? "Unauthorized.",
    };
  }

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status,
    },
  });

  revalidatePath(`/projects/${task.projectId}`);

  return {
    success: true,
    error: null,
  };
}

export async function createTask(
  prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    projectId: formData.get("projectId"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  };

  const result = taskSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const authorization = await requireProjectPermission(
    result.data.projectId,
    "CREATE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error,
    };
  }

  await prisma.task.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      projectId: result.data.projectId,
      startDate: result.data.startDate,
      dueDate: result.data.dueDate,
    },
  });

  revalidatePath(`/projects/${result.data.projectId}`);

  return {
    success: true,
    error: null,
  };
}

export async function updateTask(
  prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const data = {
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    projectId: formData.get("projectId"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  };

  const result = updateTaskSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const task = await prisma.task.findUnique({
    where: {
      id: result.data.id,
    },
    select: {
      projectId: true,
    },
  });

  if (!task) {
    return {
      success: false,
      error: "Task not found.",
    };
  }

  const authorization = await requireProjectPermission(
    task.projectId,
    "UPDATE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error,
    };
  }

  await prisma.task.update({
    where: {
      id: result.data.id,
    },
    data: {
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      startDate: result.data.startDate,
      dueDate: result.data.dueDate,
    },
  });

  revalidatePath(`/projects/${task.projectId}`);

  return {
    success: true,
    error: null,
  };
}

export async function deleteTask(
  prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const id = formData.get("id");

  const projectId = formData.get("projectId");

  if (!id || typeof id !== "string") {
    return {
      success: false,
      error: "Task ID is required.",
    };
  }

  if (!projectId || typeof projectId !== "string") {
    return {
      success: false,
      error: "Project ID is required.",
    };
  }

  const existing = await prisma.task.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      projectId: true,
    },
  });

  if (!existing) {
    return {
      success: false,
      error: "Task not found.",
    };
  }

  const authorization = await requireProjectPermission(
    existing.projectId,
    "DELETE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error,
    };
  }

  await prisma.task.delete({
    where: {
      id,
    },
  });

  revalidatePath(`/projects/${existing.projectId}`);

  return {
    success: true,
    error: null,
  };
}

export type UploadAttachmentActionState = {
  success: boolean;
  error: string | null;
};

/**
 * Attaches a file to a task.
 *
 * Flow: authenticate → authorize against the task's project → validate →
 * store bytes → persist metadata → revalidate the project page.
 *
 * Attachments are metadata rows pointing at stored bytes; the task itself is
 * never modified here, so this action requires only `UPDATE_TASK`.
 */
export async function uploadTaskAttachment(
  prevState: UploadAttachmentActionState,
  formData: FormData,
): Promise<UploadAttachmentActionState> {
  // 1. Task reference
  const taskId = formData.get("taskId");

  if (typeof taskId !== "string" || taskId.length === 0) {
    return {
      success: false,
      error: "Task ID is required.",
    };
  }

  // 2. Authentication
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  // 2.5 Rate limit: cap attachment uploads per user
  const rateLimit = await consumeRateLimit(
    `upload-attachment:${currentUser.id}`,
    "upload",
  );

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: RATE_LIMIT_EXCEEDED_MESSAGE,
    };
  }

  // 3. Authorization against the task's project
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      projectId: true,
    },
  });

  if (!task) {
    return {
      success: false,
      error: "Task not found.",
    };
  }

  const authorization = await requireProjectPermission(
    task.projectId,
    "UPDATE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error,
    };
  }

  // 4. Validate against the attachment policy
  const validation = validateFile(
    formData.get("file"),
    uploadPolicies.attachment,
  );

  if (!validation.ok) {
    return {
      success: false,
      error: fileValidationErrors[validation.error],
    };
  }

  const file = validation.file;

  // 4.5 Verify the real bytes match the declared (and allowed) MIME type
  let contentBytes: Buffer;

  try {
    contentBytes = Buffer.from(await file.arrayBuffer());
  } catch (error) {
    console.error("Failed to read uploaded attachment:", error);
    return {
      success: false,
      error: "Could not read the selected file.",
    };
  }

  const contentCheck = validateFileContent(contentBytes, file.type);

  if (!contentCheck.ok) {
    return {
      success: false,
      error: contentValidationErrors[contentCheck.error],
    };
  }

  const bytes = contentBytes;

  // 5. Derive a safe key + display name
  const storageKey = buildStorageKey("attachment", file.type);
  const originalName = sanitizeFilename(file.name);

  // 6. Store the bytes
  try {
    await getStorage().save(storageKey, bytes);
  } catch (error) {
    console.error("Failed to store attachment:", error);
    return {
      success: false,
      error: "Could not save the uploaded file.",
    };
  }

  // 7. Persist metadata
  try {
    await prisma.fileRecord.create({
      data: {
        originalName,
        mimeType: file.type,
        size: file.size,
        storageKey,
        category: "ATTACHMENT",
        uploadedById: currentUser.id,
        taskId,
      },
    });
  } catch (error) {
    console.error("Failed to persist attachment metadata:", error);

    try {
      await getStorage().delete(storageKey);
    } catch (cleanupError) {
      console.error("Failed to clean up attachment bytes:", cleanupError);
    }

    return {
      success: false,
      error: "Could not save the attachment.",
    };
  }

  // 8. Revalidate the project page so the new attachment shows up on the board
  revalidatePath(`/projects/${task.projectId}`);

  return {
    success: true,
    error: null,
  };
}

export type AttachmentUploadTicket =
  | { success: true; mode: "server" }
  | { success: true; mode: "direct"; storageKey: string; presignedUrl: string }
  | { success: false; error: string };

/**
 * Issues the client-side upload step for an attachment.
 *
 * Nesting installs of an immutable "Upload a file" `<input>`:
 *
 * - Vercel Blob production: returns a short-lived signed PUT URL scoped to a
 *   server-generated key, the declared MIME type, and the policy size limit,
 *   so the browser uploads the file (up to 10 MB) directly to the Blob store
 *   instead of through a Server Action (which is capped at ~4.5 MB on Vercel).
 * - Local development: returns `mode: "server"` and the caller keeps using the
 *   existing Server Action upload path.
 *
 * Only metadata is sent here — never the bytes. Authorization is enforced
 * against the task's project exactly like the direct upload action.
 */
export async function createAttachmentUploadTicket(input: {
  taskId: string;
  mimeType: string;
  originalName: string;
  size: number;
}): Promise<AttachmentUploadTicket> {
  // 1. Authentication
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  // 2. Authorization against the task's project
  const task = await prisma.task.findUnique({
    where: {
      id: input.taskId,
    },
    select: {
      projectId: true,
    },
  });

  if (!task) {
    return {
      success: false,
      error: "Task not found.",
    };
  }

  const authorization = await requireProjectPermission(
    task.projectId,
    "UPDATE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error ?? "Forbidden.",
    };
  }

  // 3. Validate the declared metadata against the attachment policy. The real
  // bytes are verified later (read-back) before the FileRecord is created.
  if (input.size <= 0) {
    return {
      success: false,
      error: fileValidationErrors.EMPTY_FILE,
    };
  }

  if (input.size > uploadPolicies.attachment.maxSize) {
    return {
      success: false,
      error: fileValidationErrors.FILE_TOO_LARGE,
    };
  }

  if (!uploadPolicies.attachment.allowedTypes.includes(input.mimeType)) {
    return {
      success: false,
      error: fileValidationErrors.INVALID_TYPE,
    };
  }

  // 4. Server-generated key (never a client-supplied path)
  const storageKey = buildStorageKey("attachment", input.mimeType);

  try {
    const path = await getStorageUploadPath(storageKey, {
      mimeType: input.mimeType,
      maximumSizeInBytes: uploadPolicies.attachment.maxSize,
    });

    if (path.mode === "direct") {
      return {
        success: true,
        mode: "direct",
        storageKey,
        presignedUrl: path.presignedUrl,
      };
    }

    return { success: true, mode: "server" };
  } catch (error) {
    console.error("Failed to issue attachment upload ticket:", error);
    return {
      success: false,
      error: "Could not prepare the upload. Please try again.",
    };
  }
}

/**
 * Finalizes a direct (client-uploaded) attachment.
 *
 * Called by the client after the bytes were already PUT to storage: it
 * authenticates, re-authorizes against the task's project, reads the stored
 * bytes back, verifies their content signature matches the declared MIME type,
 * and only then creates the FileRecord. Rejected uploads are removed from
 * storage so a record is never created for unvalidated bytes.
 */
export async function createAttachmentRecord(
  prevState: UploadAttachmentActionState,
  formData: FormData,
): Promise<UploadAttachmentActionState> {
  // 1. Task reference
  const taskId = formData.get("taskId");

  if (typeof taskId !== "string" || taskId.length === 0) {
    return {
      success: false,
      error: "Task ID is required.",
    };
  }

  // 2. Storage key must be a server-generated attachment key. Any key coming
  // from the client is validated against the exact shape before it is read or
  // deleted, so arbitrary paths can never reach storage.
  const storageKey = formData.get("storageKey");

  if (
    typeof storageKey !== "string" ||
    !storageKey.startsWith("attachment/") ||
    storageKey.includes("\\") ||
    storageKey.includes("..") ||
    !/^[a-z0-9/.-]+$/.test(storageKey)
  ) {
    return {
      success: false,
      error: "Invalid file reference.",
    };
  }

  // 3. Declared metadata
  const originalName = formData.get("originalName");
  const mimeType = formData.get("mimeType");
  const size = Number(formData.get("size"));

  if (typeof originalName !== "string" || originalName.length === 0) {
    return {
      success: false,
      error: "File name is required.",
    };
  }

  if (
    typeof mimeType !== "string" ||
    !uploadPolicies.attachment.allowedTypes.includes(mimeType)
  ) {
    return {
      success: false,
      error: fileValidationErrors.INVALID_TYPE,
    };
  }

  if (!Number.isInteger(size) || size <= 0) {
    return {
      success: false,
      error: "Invalid file size.",
    };
  }

  // 4. Authentication
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  // 4.5 Rate limit
  const rateLimit = await consumeRateLimit(
    `upload-attachment:${currentUser.id}`,
    "upload",
  );

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: RATE_LIMIT_EXCEEDED_MESSAGE,
    };
  }

  // 5. Authorization against the task's project
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      projectId: true,
    },
  });

  if (!task) {
    return {
      success: false,
      error: "Task not found.",
    };
  }

  const authorization = await requireProjectPermission(
    task.projectId,
    "UPDATE_TASK",
  );

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.error,
    };
  }

  // 6. Read the stored bytes back and verify they match the declared type
  let bytes: Buffer | null;

  try {
    bytes = await getStorage().read(storageKey);
  } catch (error) {
    console.error("Failed to read uploaded attachment:", error);
    return {
      success: false,
      error: "Could not read the uploaded file.",
    };
  }

  if (!bytes) {
    return {
      success: false,
      error: "The uploaded file could not be found.",
    };
  }

  const tooLarge = bytes.byteLength > uploadPolicies.attachment.maxSize;
  const contentCheck = validateFileContent(bytes, mimeType);

  if (tooLarge || !contentCheck.ok) {
    try {
      await getStorage().delete(storageKey);
    } catch (cleanupError) {
      console.error("Failed to clean up rejected attachment:", cleanupError);
    }

    return {
      success: false,
      error: tooLarge
        ? fileValidationErrors.FILE_TOO_LARGE
        : contentCheck.ok
          ? fileValidationErrors.INVALID_TYPE
          : contentValidationErrors[contentCheck.error],
    };
  }

  // 7. Persist metadata
  try {
    await prisma.fileRecord.create({
      data: {
        originalName: sanitizeFilename(originalName),
        mimeType,
        size: bytes.byteLength,
        storageKey,
        category: "ATTACHMENT",
        uploadedById: currentUser.id,
        taskId,
      },
    });
  } catch (error) {
    // A unique-key collision means this storageKey is already recorded; the
    // bytes keep their existing record and must NOT be deleted here.
    if ((error as { code?: string }).code === "P2002") {
      return {
        success: false,
        error: "This file was already added to the task.",
      };
    }

    console.error("Failed to persist attachment metadata:", error);

    try {
      await getStorage().delete(storageKey);
    } catch (cleanupError) {
      console.error("Failed to clean up attachment bytes:", cleanupError);
    }

    return {
      success: false,
      error: "Could not save the attachment.",
    };
  }

  // 8. Revalidate the project page so the new attachment shows up on the board
  revalidatePath(`/projects/${task.projectId}`);

  return {
    success: true,
    error: null,
  };
}
