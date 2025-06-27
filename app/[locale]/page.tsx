import { serverCmsApi, FriendLink } from '@/lib/server-api';
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
import { GoogleOneTapAuth } from "../../components/auth";


// App Router中的数据获取函数
async function getFriendlyLinks(): Promise<FriendLink[]> {
  try {
    const friendlyLinks = await serverCmsApi.getFriendLinkList();
    console.log('App Router: Successfully fetched friend links:', friendlyLinks.length);
    return  friendlyLinks
  } catch (error) {
    console.error('App Router: Failed to fetch friend links, using fallback:', error);
    return [];
  }
}

export default async function Home() {
  // 在App Router中直接获取数据
  const friendlyLinks = await getFriendlyLinks();

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col">
        {/* Google One Tap 组件 - 只在用户未登录时显示 */}
        <GoogleOneTapAuth
          cancelOnTapOutside={true}
          signInForceRedirectUrl="/"
          signUpForceRedirectUrl="/"
        />
        
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
        <Footer friendlyLinks={friendlyLinks} />
      </div>
    </PageLayout>
  );
}

// App Router的ISR配置
export const revalidate = 3600; // 每小时重新验证一次
