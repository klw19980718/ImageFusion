"use client";

import { useTranslations } from "next-intl";
import ComparisonSlider from "../../components/ComparisonSlider";
import PricingSection from "../../components/PricingSection";
import HeroSection from "../../components/HeroSection";
import FeaturesSection from "../../components/FeaturesSection";
import DemoSection from "../../components/DemoSection";
import TestimonialsSection from "../../components/TestimonialsSection";
import FaqSection from "../../components/FaqSection";
import StyleShowcaseSection from "../../components/StyleShowcaseSection";
import { Footer } from "../../components/Footer";
import PageLayout from "./page-layout";

export default function Home() {
  const t = useTranslations("home");

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          {/* Hero Section */}
          <HeroSection />

          {/* Style Showcase Section */}
          <section id="showcase">
            <StyleShowcaseSection />
          </section>

          {/* Features Section */}
          <section id="features">
            <FeaturesSection />
          </section>

          {/* Demo Section */}
          <section id="demo">
            <DemoSection />
          </section>


          {/* Pricing Section */}
          <section id="pricing">
            <PricingSection />
          </section>

          {/* FAQ Section */}
          <section id="faq">
            <FaqSection />
          </section>
        </main>
        <Footer />
      </div>
    </PageLayout>
  );
}
