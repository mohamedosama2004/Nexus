"use client";

import { useActionState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateAvatar, type AvatarActionState } from "@/src/actions/user.actions";
import { SubmitButton } from "@/src/components/buttons/SubmitButton";

type AvatarUploadFormProps = {
  name: string;
  avatarFile: { storageKey: string } | null;
};

const ACCEPTED_MIME_TYPES = "image/jpeg,image/png,image/webp";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AvatarUploadForm({
  name,
  avatarFile,
}: AvatarUploadFormProps) {
  const [state, formAction] = useActionState(updateAvatar, {
    success: false,
    error: null,
  } satisfies AvatarActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Avatar updated!");
    }
  }, [state]);

  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body items-center text-center">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary/10">
          {avatarFile ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/files/${avatarFile.storageKey}`}
              alt={`${name}'s avatar`}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-primary">
              {initials(name)}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold">{name}</h3>

        <form
          action={formAction}
          className="mt-2 flex w-full max-w-sm flex-col gap-3"
        >
          <div>
            <label htmlFor="avatar" className="label font-medium">
              Upload a new avatar
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept={ACCEPTED_MIME_TYPES}
              required
              className="file-input file-input-bordered w-full"
              aria-describedby="avatar-error"
            />
            {state.error && (
              <p id="avatar-error" className="mt-1 text-sm text-error">
                {state.error}
              </p>
            )}
          </div>

          <SubmitButton label="Upload avatar" pendingLabel="Uploading..." />
        </form>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}