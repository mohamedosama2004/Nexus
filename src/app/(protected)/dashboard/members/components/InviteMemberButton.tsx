"use client";

import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { InviteMemberModal } from "./InviteMemberModal";

export function InviteMemberButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-primary btn-sm h-10 rounded-lg px-4"
      >
        <UserPlusIcon className="h-4 w-4" />
        Invite member
      </button>

      <InviteMemberModal open={open} onClose={() => setOpen(false)} />

      {/* Stays mounted so toasts survive the modal closing */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
