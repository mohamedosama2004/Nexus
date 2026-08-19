import type { ReactNode } from "react";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-base-200 bg-base-100 p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-base-content">{title}</h3>
      <p className="text-sm leading-relaxed text-base-content/60">
        {description}
      </p>
    </div>
  );
}
