'use client';

import ComparisonSlider from '../../components/ComparisonSlider';
import PricingSection from '../../components/PricingSection';
import HeroSection from '../../components/HeroSection';
import UseCasesSection from '../../components/UseCasesSection';
import HowItWorksSection from '../../components/HowItWorksSection';
import BenefitsSection from '../../components/BenefitsSection';
import FaqSection from '../../components/FaqSection';
import { Footer } from '../../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />

        {/* Use Cases Section */}
        <UseCasesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
} 