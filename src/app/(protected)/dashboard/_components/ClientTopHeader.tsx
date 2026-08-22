"use client";

import { ThemeToggle } from "../../../../components/Themes/ThemeToggle";
import NotificationsBell from "./NotificationBell";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { WorkspaceSwitcher } from "../../../../components/WorkspaceSwitcher";

type User = {
  id: string;
  name: string;
  email: string;
} | null;

export function ClientTopHeader({ user }: { user: User }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-base-200 bg-base-100 px-4 lg:px-6">
      {/* switcher component */}
      <WorkspaceSwitcher />

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationsBell />

        {/* User profile dropdown */}
        <UserProfileDropdown user={user} />
      </div>
    </header>
  );
}
