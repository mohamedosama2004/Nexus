"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import type { WorkspaceMember } from "@/src/lib/data/members";

const PROJECT_ROLES = ["MEMBER", "OWNER"] as const;

type InviteProjectMemberModalProps = {
  projectId: string;
  members: WorkspaceMember[];
  open: boolean;
  onClose: () => void;
};

export function InviteProjectMemberModal({
  projectId,
  members,
  open,
  onClose,
}: InviteProjectMemberModalProps) {
  if (!open) return null;

  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
        >
          ✕
        </button>

        <InviteProjectMemberForm
          projectId={projectId}
          members={members}
          onClose={onClose}
        />
      </div>
    </dialog>
  );
}

function InviteProjectMemberForm({
  projectId,
  members,
  onClose,
}: {
  projectId: string;
  members: WorkspaceMember[];
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof PROJECT_ROLES)[number]>("MEMBER");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPending(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/invitations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to send invitation.");
      }

      toast.success(`Invitation sent to ${email}`);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send invitation.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-base-content">
          Add a member
        </h3>
        <p className="mt-0.5 text-sm text-base-content/50">
          They will receive an invitation to join this project.
        </p>
      </div>

      <div className="form-control w-full">
        <span className="mb-1.5 text-sm font-medium text-base-content/70">
          Workspace member
        </span>
        {members.length === 0 ? (
          <p className="rounded-xl border border-dashed border-base-300 px-3 py-4 text-center text-sm text-base-content/50">
            No workspace members left to invite
          </p>
        ) : (
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {members.map((member) => {
              const isSelected = email === member.email;

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setEmail(member.email)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "border-primary/60 bg-primary/5"
                      : "border-transparent hover:bg-base-200/50"
                  }`}
                >
                  {/* Placeholder until profile pictures are added */}
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {member.name.trim()[0]?.toUpperCase() ?? "?"}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-base-content">
                      {member.name}
                    </span>
                    <span className="block truncate text-xs text-base-content/50">
                      {member.email}
                    </span>
                  </span>

                  <span
                    aria-hidden
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-content"
                        : "border-base-300"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        className="size-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5 13 4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {email && (
        <label className="form-control w-full">
          <span className="mb-1.5 text-sm font-medium text-base-content/70">
            Role
          </span>
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as (typeof PROJECT_ROLES)[number])
            }
            className="select select-bordered w-full capitalize"
          >
            {PROJECT_ROLES.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r.toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* <label className="form-control w-full">
        <span className="mb-1.5 text-sm font-medium text-base-content/70">
          Role
        </span>
        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as (typeof PROJECT_ROLES)[number])
          }
          className="select select-bordered w-full capitalize"
        >
          {PROJECT_ROLES.map((r) => (
            <option key={r} value={r} className="capitalize">
              {r.toLowerCase()}
            </option>
          ))}
        </select>
      </label> */}

      <div className="modal-action">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost"
          disabled={pending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={pending || !email}
        >
          {pending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : null}
          Send invitation
        </button>
      </div>
    </form>
  );
}
