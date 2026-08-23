"use client";

import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import type { WorkspaceMember } from "@/src/lib/data/members";
import { InviteProjectMemberModal } from "./InviteProjectMemberModal";

type InviteProjectMemberButtonProps = {
  projectId: string;
  members: WorkspaceMember[];
};

export function InviteProjectMemberButton({
  projectId,
  members,
}: InviteProjectMemberButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-primary btn-sm h-10 rounded-lg px-4 ml-auto"
      >
        <UserPlusIcon className="h-4 w-4" />
        Add member
      </button>

      <InviteProjectMemberModal
        projectId={projectId}
        members={members}
        open={open}
        onClose={() => setOpen(false)}
      />

      {/* Stays mounted so toasts survive the modal closing */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
