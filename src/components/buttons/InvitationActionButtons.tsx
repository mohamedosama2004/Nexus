"use client";

import { useState } from "react";

type InvitationButtonProps = {
  invitationId: string;
  onDone?: () => void;
};

async function respondToInvitation(
  invitationId: string,
  action: "ACCEPT" | "DECLINE"
) {
  const response = await fetch(`/api/invitations/${invitationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Something went wrong");
  }
}

export function AcceptButton({
  invitationId,
  onDone,
}: InvitationButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setPending(true);
    setError(null);
    try {
      await respondToInvitation(invitationId, "ACCEPT");
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleAccept}
        disabled={pending}
        className="btn btn-success btn-xs"
      >
        {pending ? "..." : "Accept"}
      </button>
      {error && <span className="text-[10px] text-error">{error}</span>}
    </div>
  );
}

export function DeclineButton({
  invitationId,
  onDone,
}: InvitationButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecline = async () => {
    setPending(true);
    setError(null);
    try {
      await respondToInvitation(invitationId, "DECLINE");
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDecline}
        disabled={pending}
        className="btn btn-error btn-outline btn-xs"
      >
        {pending ? "..." : "Decline"}
      </button>
      {error && <span className="text-[10px] text-error">{error}</span>}
    </div>
  );
}
