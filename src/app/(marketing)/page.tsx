import { MarketingNavbar } from "./components/MarketingNavbar";
import { HeroSection } from "./components/HeroSection";
import { LogoCloud } from "./components/LogoCloud";
import { FeaturesSection } from "./components/FeaturesSection";
import { ProductShowcase } from "./components/ProductShowcase";
import { CollaborationSection } from "./components/CollaborationSection";
import { WorkflowSection } from "./components/WorkflowSection";
import { PricingSection } from "./components/PricingSection";
import { TestimonialSection } from "./components/TestimonialSection";
import { CTASection } from "./components/CTASection";
import { MarketingFooter } from "./components/MarketingFooter";
import { ScrollReveal } from "./components/ScrollReveal";

export default function MarketingPage() {
  return (
    <>
      <main>
        <HeroSection />
        <ScrollReveal>
          <LogoCloud />
        </ScrollReveal>
        <ScrollReveal>
          <FeaturesSection />
        </ScrollReveal>
        <ScrollReveal>
          <ProductShowcase />
        </ScrollReveal>
        <ScrollReveal>
          <CollaborationSection />
        </ScrollReveal>
        <ScrollReveal>
          <WorkflowSection />
        </ScrollReveal>
      
        <ScrollReveal>
          <TestimonialSection />
        </ScrollReveal>
        <ScrollReveal>
          <CTASection />
        </ScrollReveal>
      </main>
    </>
  );
}
