"use client";

import { useState } from "react";
import { PricingCard } from "./PricingCard";

const plans = [
  {
    name: "Free",
    monthly: "$0",
    yearly: "$0",
    subtitle: "For individuals and small teams getting started.",
    cta: "Get started",
    ctaHref: "/register",
    features: [
      "Up to 5 users",
      "3 projects",
      "Unlimited tasks",
      "Basic task management",
      "Basic dashboard",
      "Community support",
    ],
  },
  {
    name: "Starter",
    monthly: "$7",
    yearly: "$6",
    subtitle: "For growing teams managing real projects.",
    cta: "Start free trial",
    ctaHref: "/register",
    features: [
      "Up to 10 users",
      "Unlimited projects",
      "Advanced task management",
      "Project dashboards",
      "Search and filtering",
      "File attachments",
      "Email support",
    ],
  },
  {
    name: "Business",
    monthly: "$15",
    yearly: "$12",
    subtitle: "For teams that need powerful collaboration.",
    cta: "Start free trial",
    ctaHref: "/register",
    badge: "Most popular",
    features: [
      "Unlimited users",
      "Unlimited projects",
      "Advanced dashboards",
      "Advanced permissions",
      "Team workspaces",
      "Priority support",
      "Advanced analytics",
      "Automation",
      "Activity history",
    ],
  },
  {
    name: "Enterprise",
    monthly: "Let's talk",
    yearly: "Let's talk",
    subtitle: "For organizations that need security and scale.",
    cta: "Contact sales",
    ctaHref: "/about",
    features: [
      "Everything in Business",
      "Advanced access control",
      "Custom roles",
      "Enterprise security",
      "Audit logs",
      "Dedicated support",
      "Custom integrations",
      "Custom onboarding",
    ],
  },
];

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-base-100 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Simple, transparent pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            Choose the plan that fits your team
          </h2>
          <p className="mt-4 text-lg text-base-content/60">
            Start free, scale when your team grows.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-base-200 bg-base-200/40 p-1">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !yearly
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/50 hover:text-base-content/70"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                yearly
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/50 hover:text-base-content/70"
              }`}
            >
              Yearly
              <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mx-auto mt-14 grid max-w-6xl items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={yearly ? plan.yearly : plan.monthly}
              period={plan.monthly === "Let's talk" ? undefined : "/ user / month"}
              subtitle={plan.subtitle}
              cta={plan.cta}
              ctaHref={plan.ctaHref}
              features={plan.features}
              highlighted={plan.name === "Business"}
              badge={plan.badge}
            />
          ))}
        </div>

        {/* Note */}
        <p className="mt-12 text-center text-sm text-base-content/40">
          All plans include secure cloud storage, responsive support, and access
          to the latest Nexus features.
        </p>
      </div>
    </section>
  );
}
