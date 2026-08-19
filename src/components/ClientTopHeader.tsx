"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/src/actions/auth.actions";
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

type User = {
  id: string;
  name: string;
  email: string;
} | null;

export function ClientTopHeader({ user }: { user: User }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-base-200 bg-base-100 px-4 lg:px-6">
      {/* Search */}
      <div className="hidden flex-1 md:block">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-full rounded-lg border border-base-200 bg-base-200/50 pl-10 pr-4 text-sm text-base-content placeholder-base-content/40 outline-none transition-colors focus:border-primary focus:bg-base-100"
          />
        </div>
      </div>

      {/* Mobile search icon */}
      <button className="flex size-10 items-center justify-center rounded-lg border border-base-200 bg-base-100 text-base-content/60 md:hidden">
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex size-10 items-center justify-center rounded-lg border border-base-200 bg-base-100 text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content">
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
        </button>

        {/* User profile dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-base-200"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </div>
            <div className="hidden text-left lg:block">
              <div className="text-sm font-medium text-base-content">{user?.name || "User"}</div>
              <div className="text-xs text-base-content/50">{user?.email || ""}</div>
            </div>
            <ChevronDownIcon className={`hidden h-4 w-4 text-base-content/40 transition-transform duration-200 lg:block ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-base-200 bg-base-100 shadow-xl">
              {/* User info */}
              <div className="border-b border-base-200 px-4 py-3">
                <div className="text-sm font-medium text-base-content">{user?.name || "User"}</div>
                <div className="text-xs text-base-content/50">{user?.email || ""}</div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
                >
                  <UserCircleIcon className="h-4 w-4" />
                  View Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  Account Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-base-200 py-1.5">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-error/70 transition-colors hover:bg-error/10 hover:text-error"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
