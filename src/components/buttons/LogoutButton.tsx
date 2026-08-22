"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { logout } from "@/src/actions/auth.actions";

export function LogoutButton({ onLogout }: { onLogout?: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    try {
      onLogout?.();
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-error/70 transition-colors hover:bg-error/10 hover:text-error"
    >
      <ArrowLeftOnRectangleIcon className="h-4 w-4" />
      {pending ? "Logging out..." : "Log out"}
    </button>
  );
}
