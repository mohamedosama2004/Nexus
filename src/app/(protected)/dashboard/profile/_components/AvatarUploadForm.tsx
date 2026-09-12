"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { updateAvatar, type AvatarActionState } from "@/src/actions/user.actions";
import { SubmitButton } from "@/src/components/buttons/SubmitButton";
import { UserAvatar } from "@/src/components/UserAvatar";

type AvatarUploadFormProps = {
  name: string;
  avatarFile: { storageKey: string } | null;
};

const ACCEPTED_MIME_TYPES = "image/jpeg,image/png,image/webp";

export default function AvatarUploadForm({
  name,
  avatarFile,
}: AvatarUploadFormProps) {
  const [state, formAction] = useActionState(updateAvatar, {
    success: false,
    error: null,
  } satisfies AvatarActionState);

  useEffect(() => {
    if (!state.success) return;

    toast.success("Avatar updated!");
  }, [state]);

  // Keyed by the saved avatar's storage key: a successful upload revalidates
  // the server, the profile page re-renders with a new avatarFile, and this
  // picker remounts with a clean, no-longer-stale selection.
  return (
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <ProfileAvatarPicker
        key={avatarFile?.storageKey ?? "none"}
        name={name}
        avatarFile={avatarFile}
        formAction={formAction}
        error={state.error}
      />
    </section>
  );
}

function ProfileAvatarPicker({
  name,
  avatarFile,
  formAction,
  error,
}: {
  name: string;
  avatarFile: { storageKey: string } | null;
  formAction: (payload: FormData) => void;
  error: string | null;
}) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasAvatar = avatarFile !== null;

  const clearSelection = useCallback(() => {
    setSelectedUrl(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    const url = selectedUrl;

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [selectedUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setSelectedUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="card-body gap-7 p-6 sm:p-7">
      <div className="flex items-center gap-5">
        <div className="relative">
          {selectedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedUrl}
              alt="New photo preview"
              className="size-24 rounded-full object-cover ring-2 ring-primary"
            />
          ) : (
            <UserAvatar
              name={name}
              storageKey={avatarFile?.storageKey ?? null}
              alt={`${name}'s current avatar`}
              className="size-24 bg-primary/10 text-primary"
              textClassName="text-3xl font-semibold"
              fallback="initials"
            />
          )}
          {selectedUrl && (
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-content">
              New photo
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-base-content">
            {name}
          </h2>
          <p className="text-sm text-base-content/50">Account profile</p>
        </div>
      </div>

      <form action={formAction} className="border-t border-base-200 pt-6">
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="avatar"
              className="block text-sm font-semibold text-base-content"
            >
              Profile photo
            </label>
            <p className="mt-0.5 text-sm text-base-content/50">
              {hasAvatar
                ? "This is your current profile photo. Choose a new image to replace it."
                : "Add a photo to personalize your account."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              id="avatar"
              name="avatar"
              ref={inputRef}
              type="file"
              accept={ACCEPTED_MIME_TYPES}
              required
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full sm:flex-1"
              aria-describedby={
                error ? "avatar-error" : selectedUrl ? "avatar-hint" : undefined
              }
              aria-invalid={error ? true : undefined}
            />
            <SubmitButton
              label={hasAvatar ? "Change avatar" : "Upload avatar"}
              pendingLabel="Uploading..."
            />
          </div>

          {selectedUrl && (
            <div className="flex flex-wrap items-center gap-3">
              <p id="avatar-hint" className="text-sm text-success">
                A new photo is selected — upload to apply it.
              </p>
              <button
                type="button"
                onClick={clearSelection}
                className="btn btn-ghost btn-xs text-base-content/60"
              >
                Cancel selection
              </button>
            </div>
          )}

          {error && (
            <p id="avatar-error" className="text-sm text-error">
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}