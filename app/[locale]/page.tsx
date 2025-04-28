// import { Navbar } from '../../components/Navbar';

import ComparisonSlider from '../../components/ComparisonSlider';
import PricingSection from '../../components/PricingSection';

import { Footer } from '../../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <ComparisonSlider />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
} 