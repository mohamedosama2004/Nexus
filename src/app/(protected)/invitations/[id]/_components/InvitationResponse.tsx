"use client";

import { useRouter } from "next/navigation";

import {
  AcceptButton,
  DeclineButton,
} from "@/src/components/buttons/InvitationActionButtons";

type InvitationResponseProps = {
  invitationId: string;
};

export function InvitationResponse({
  invitationId,
}: InvitationResponseProps) {
  const router = useRouter();

  const handleDone = () => {
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <AcceptButton invitationId={invitationId} onDone={handleDone} />
      <DeclineButton invitationId={invitationId} onDone={handleDone} />
    </div>
  );
}
