import Link from "next/link";

import { SettingsSection } from "./SettingsSection";

/**
 * Points to the existing Profile page (/dashboard/profile). The profile page
 * owns avatar upload and account information, so no profile UI is duplicated
 * here.
 */
export function ProfileSettings() {
  return (
    <SettingsSection
      title="Profile"
      description="Manage your profile information and avatar."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-base-content/60">
          Update your name, email, and profile photo on the dedicated profile
          page.
        </p>
        <Link
          href="/dashboard/profile"
          className="btn btn-primary btn-sm h-10 shrink-0 self-start rounded-lg px-4 sm:self-auto"
        >
          Open Profile
        </Link>
      </div>
    </SettingsSection>
  );
}