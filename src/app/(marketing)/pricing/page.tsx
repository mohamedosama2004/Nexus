
import type { Metadata } from "next";

import { PricingSection } from "../components/PricingSection";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Nexus plans. Start free and scale as your team grows.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <>
      <PricingSection />
    </>
  );
}
