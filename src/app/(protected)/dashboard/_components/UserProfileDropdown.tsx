"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { LogoutButton } from "@/src/components/buttons/LogoutButton";

type User = {
  id: string;
  name: string;
  email: string;
} | null;

export function UserProfileDropdown({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-base-200"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials}
        </div>
        <div className="hidden text-left lg:block">
          <div className="text-sm font-medium text-base-content">
            {user?.name || "User"}
          </div>
          <div className="text-xs text-base-content/50">
            {user?.email || ""}
          </div>
        </div>
        <ChevronDownIcon
          className={`hidden h-4 w-4 text-base-content/40 transition-transform duration-200 lg:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-base-200 bg-base-100 shadow-xl">
          {/* User info */}
          <div className="border-b border-base-200 px-4 py-3">
            <div className="text-sm font-medium text-base-content">
              {user?.name || "User"}
            </div>
            <div className="text-xs text-base-content/50">
              {user?.email || ""}
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5 flex flex-col ">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
            >
              <UserCircleIcon className="h-4 w-4" />
              View Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              Account Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-base-200 py-1.5">
            <LogoutButton onLogout={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
