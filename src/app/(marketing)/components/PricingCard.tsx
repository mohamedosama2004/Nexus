import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";

type PricingCardProps = {
  name: string;
  price: string;
  period?: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
};

export function PricingCard({
  name,
  price,
  period,
  subtitle,
  cta,
  ctaHref,
  features,
  highlighted = false,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 sm:p-8 ${
        highlighted
          ? "border-primary/30 bg-base-100 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10"
          : "border-base-200 bg-base-100 hover:border-base-300 hover:shadow-md"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="badge badge-primary badge-sm px-3 font-semibold">
            {badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-base-content">{name}</h3>
        <p className="mt-1 text-sm text-base-content/50">{subtitle}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold tracking-tight text-base-content">
          {price}
        </span>
        {period && (
          <span className="ml-1 text-sm text-base-content/50">{period}</span>
        )}
      </div>

      <Link
        href={ctaHref}
        className={`btn w-full ${
          highlighted ? "btn-primary" : "btn-outline btn-primary"
        }`}
      >
        {cta}
      </Link>

      <div className="my-6 h-px bg-base-200" />

      <ul className="flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-base-content/70">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
