"use client";

import { useCallback, useRef, useState } from "react";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import {
  createAttachmentRecord,
  createAttachmentUploadTicket,
  uploadTaskAttachment,
  type UploadAttachmentActionState,
} from "@/src/actions/task.actions";
import type { ProjectAttachment } from "./types";

type Props = {
  taskId: string;
  attachments: ProjectAttachment[];
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // mirrors uploadPolicies.attachment

const ACCEPTED_MIME_TYPES =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,application/json,text/csv,application/zip";

const ACCEPTED_MIME_SET = new Set(ACCEPTED_MIME_TYPES.split(","));

const INITIAL_STATE: UploadAttachmentActionState = {
  success: false,
  error: null,
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TaskAttachmentModal({
  taskId,
  attachments,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const [formKey, setFormKey] = useState(0);
  const [modalClosing, setModalClosing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeModal = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || isClosingRef.current) return;

    isClosingRef.current = true;
    setModalClosing(true);

    const finishClose = () => {
      dialog.classList.remove("modal-closing");
      if (dialog.open) dialog.close();
      isClosingRef.current = false;
      setModalClosing(false);
    };

    dialog.addEventListener(
      "animationend",
      (event) => {
        if (event.target !== dialog) return;
        finishClose();
      },
      { once: true },
    );

    window.setTimeout(() => {
      if (dialog.open) finishClose();
    }, 300);
  }, []);

  function openModal() {
    setFormKey((key) => key + 1);
    setError(null);
    dialogRef.current?.showModal();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File)) {
      setError("Please choose a file to upload.");
      return;
    }

    if (file.size === 0) {
      setError("The chosen file is empty.");
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError("The file is larger than the allowed size.");
      return;
    }

    if (!ACCEPTED_MIME_SET.has(file.type)) {
      setError("This file type is not allowed.");
      return;
    }

    setError(null);
    setPending(true);

    try {
      const ticket = await createAttachmentUploadTicket({
        taskId,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });

      if (!ticket.success) {
        setError(ticket.error);
        return;
      }

      const result =
        ticket.mode === "server"
          ? // Local filesystem driver: the bytes travel through a Server Action.
            await uploadTaskAttachment(INITIAL_STATE, formData)
          : await uploadDirectly(ticket.storageKey, ticket.presignedUrl, file);

      if (!result.success) {
        setError(result.error);
        return;
      }

      toast.success("Attachment uploaded!");
      closeModal();
    } catch (uploadError) {
      console.error("Attachment upload error:", uploadError);
      setError("Something went wrong while uploading the file.");
    } finally {
      setPending(false);
    }
  }

  async function uploadDirectly(
    storageKey: string,
    presignedUrl: string,
    file: File,
  ): Promise<UploadAttachmentActionState> {
    // Vercel Blob: PUT the bytes straight to the signed URL, then finalize the
    // FileRecord on the server (which validates the stored bytes by read-back).
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "content-type": file.type },
      body: file,
    });

    if (!response.ok) {
      console.error(
        "Direct attachment upload failed:",
        response.status,
        await response.text().catch(() => ""),
      );
      return {
        success: false,
        error: "Could not upload the file. Please try again.",
      };
    }

    const finalizeForm = new FormData();
    finalizeForm.set("taskId", taskId);
    finalizeForm.set("storageKey", storageKey);
    finalizeForm.set("originalName", file.name);
    finalizeForm.set("mimeType", file.type);
    finalizeForm.set("size", String(file.size));

    return createAttachmentRecord(INITIAL_STATE, finalizeForm);
  }

  return (
    <>
      <button
        className="btn btn-ghost btn-sm btn-square"
        onClick={openModal}
        aria-label={`Manage attachments (${attachments.length})`}
        title="Attachments"
      >
        <span className="relative">
          <PaperClipIcon className="size-4" />
          {attachments.length > 0 && (
            <span className="absolute -right-1.5 -top-1.5 rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-content">
              {attachments.length}
            </span>
          )}
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className={`modal ${modalClosing ? "modal-closing" : ""}`}
        aria-labelledby="attachment-modal-title"
        onCancel={(event) => {
          event.preventDefault();
          closeModal();
        }}
      >
        <div className="modal-box">
          <button
            type="button"
            aria-label="Close"
            onClick={closeModal}
            className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          >
            ✕
          </button>

          <div>
            <h3 id="attachment-modal-title" className="text-lg font-bold">
              Attachments
            </h3>
            <p className="text-sm text-base-content/60">
              Files uploaded to this task.
            </p>
          </div>

          {/* Existing attachments */}
          <ul className="mt-4 space-y-2">
            {attachments.length === 0 && (
              <li className="text-sm text-base-content/50">
                No attachments yet.
              </li>
            )}

            {attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-base-200 px-3 py-2"
              >
                <a
                  href={`/api/files/${attachment.storageKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 truncate text-sm text-primary hover:underline"
                  title={attachment.originalName}
                >
                  {attachment.originalName}
                </a>
                <span className="shrink-0 text-xs text-base-content/50">
                  {formatBytes(attachment.size)}
                </span>
              </li>
            ))}
          </ul>

          {/* Upload form */}
          <form key={formKey} onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input type="hidden" name="taskId" value={taskId} />

            <div>
              <label
                htmlFor={`attachment-file-${taskId}`}
                className="label font-medium"
              >
                Upload a file
              </label>
              <input
                id={`attachment-file-${taskId}`}
                name="file"
                type="file"
                accept={ACCEPTED_MIME_TYPES}
                required
                disabled={pending}
                className="file-input file-input-bordered w-full"
                aria-describedby={`attachment-file-error-${taskId}`}
              />
              {error && (
                <p
                  id={`attachment-file-error-${taskId}`}
                  className="mt-1 text-sm text-error"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={closeModal}
                disabled={pending}
              >
                Cancel
              </button>
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>

        <form
          className="modal-backdrop"
          onSubmit={(event) => {
            event.preventDefault();
            closeModal();
          }}
        >
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </>
  );
}