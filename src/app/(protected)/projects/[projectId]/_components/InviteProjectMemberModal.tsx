"use client";

import { useState } from "react";
import { toast } from "react-toastify";

const PROJECT_ROLES = ["MEMBER", "OWNER"] as const;

type InviteProjectMemberModalProps = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export function InviteProjectMemberModal({
  projectId,
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

        <InviteProjectMemberForm projectId={projectId} onClose={onClose} />
      </div>
    </dialog>
  );
}

function InviteProjectMemberForm({
  projectId,
  onClose,
}: {
  projectId: string;
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

      <label className="form-control w-full">
        <span className="mb-1.5 text-sm font-medium text-base-content/70">
          Email
        </span>
        <input
          autoFocus
          type="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>

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
