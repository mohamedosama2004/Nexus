import type { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  danger?: boolean;
};

export function SettingsSection({
  title,
  description,
  children,
  danger = false,
}: SettingsSectionProps) {
  return (
    <section
      className={`card border bg-base-100 shadow-sm ${
        danger ? "border-error/30" : "border-base-200"
      }`}
    >
      <div className="card-body gap-5 p-6 sm:p-7">
        <div>
          <h2
            className={`text-lg font-semibold ${
              danger ? "text-error" : "text-base-content"
            }`}
          >
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-base-content/50">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}