import { SettingsSection } from "./SettingsSection";
import { ChangePasswordForm } from "./ChangePasswordForm";

type SecuritySettingsProps = {
  hasPassword: boolean;
};

export function SecuritySettings({ hasPassword }: SecuritySettingsProps) {
  return (
    <SettingsSection
      title="Security"
      description="Manage your account security."
    >
      {hasPassword ? (
        <ChangePasswordForm />
      ) : (
        <p className="rounded-lg border border-base-200 bg-base-200/40 px-3 py-2 text-sm text-base-content/60">
          Password changes are unavailable for accounts that don&apos;t have a
          password.
        </p>
      )}
    </SettingsSection>
  );
}