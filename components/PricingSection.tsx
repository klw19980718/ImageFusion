"use client";

import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { apiConfig } from "@/app/config/api";
import pricingPlans from "@/app/config/price";

export default function PricingSection() {
  const t = useTranslations("pricing");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  // 处理点击升级按钮的异步函数
  const handleUpgradeClick = async (priceId: string, planKey: string) => {
    // 1. 检查用户是否登录
    if (!isSignedIn) {
      // 如果未登录，打开 Clerk 登录框
      openSignIn();
      return; // 阻止后续操作
    }

    // 2. 获取用户 ID (确保用户存在且有 ID)
    const userId = user?.id;
    if (!userId) {
      console.error("User is signed in but user ID is missing.");
      // 可以选择提示用户或记录错误
      alert(
        t("error.missingUserId", {
          defaultMessage:
            "Could not get user information. Please try refreshing the page.",
        })
      );
      return;
    }

    setLoadingPlan(planKey); // 设置当前加载的计划
    try {
      // 3. 使用真实的用户 ID 调用 API
      const response = await fetch(apiConfig.stripeSubscriptionCreate, {
        method: "POST",
        body: JSON.stringify({
          google_id: userId, // 使用 Clerk user.id 作为 google_id 发送给后端
          price_id: priceId,
          website: "ai_polatoons", //站点标识,默认现在站点ai_polaroid，其他站点的以后增加
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: t("error.generic") }));
        console.error(
          "Stripe subscription creation failed:",
          response.status,
          errorData
        );
        alert(errorData.message || t("error.generic"));
        setLoadingPlan(null);
        return;
      }

      const data = await response.json();

      // 检查返回的数据结构是否符合预期（之前是 data.data.url）
      // 请根据您的 API 实际返回结构调整
      const checkoutUrl = data?.data?.url || data?.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        console.error("Stripe subscription response missing URL:", data);
        alert(t("error.missingUrl"));
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error("Error during subscription creation request:", error);
      alert(t("error.network"));
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-20 px-6 bg-background">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-foreground">
          {t("title")}
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          {t("description")}
        </p>

        {/* --- 恢复三栏布局 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const planDetails = t.raw(plan.key);
            if (
              !planDetails ||
              typeof planDetails !== "object" ||
              !("title" in planDetails) ||
              !("price" in planDetails) ||
              !("features" in planDetails) ||
              !Array.isArray(planDetails.features)
            ) {
              console.warn(
                `Pricing plan details missing or malformed for key: ${plan.key}`
              );
              return null;
            }
            const features = planDetails.features as string[];
            const isBasic = plan.key === "basic"; // 检查是否是 Basic 计划

            return (
              <div
                key={plan.key}
                className={cn(
                  "rounded-standard p-8 flex flex-col h-full relative shadow-custom transition-standard",
                  plan.popular
                    ? "bg-card border-2 border-primary"
                    : "bg-card border border-muted/30"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1.5 rounded-full text-sm font-bold shadow-md">
                    {t("mostPopular")}
                  </div>
                )}

                <h3 className="text-2xl font-semibold mb-2 text-center text-foreground">
                  {planDetails.title}
                </h3>

                {/* 始终显示价格 */}
                <div className="text-center mb-8">
                  <span className="text-5xl font-bold text-primary">
                    {planDetails.price}{" "}
                    {/* 直接使用翻译文件中的价格，包括 "$0" */}
                  </span>
                  {/* 对 basic 也显示 /月，如果需要可以条件隐藏 */}
                  {/* <span className="text-gray-400 text-lg ml-1">{t('perMonth')}</span> */}
                  {/* 或者条件显示 */}
                  {!isBasic && (
                    <span className="text-muted-foreground text-lg ml-1">
                      {t("perMonth")}
                    </span>
                  )}
                </div>

                {/* 始终显示按钮，但 basic 是禁用状态 */}
                <Button
                  className={cn(
                    "w-full mb-6 transition-standard",
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : isBasic
                      ? "bg-muted text-muted-foreground cursor-not-allowed" // Basic 禁用样式
                      : "bg-card text-foreground hover:bg-muted border border-primary"
                  )}
                  onClick={() =>
                    !isBasic && handleUpgradeClick(plan.priceId, plan.key)
                  } // Basic 不触发 onClick
                  disabled={loadingPlan === plan.key || isBasic} // Basic 计划始终禁用
                >
                  {loadingPlan === plan.key ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("loading")}
                    </span>
                  ) : isBasic ? (
                    t("currentPlanText")
                  ) : (
                    t("upgradePlan")
                  )}
                </Button>
                {/* 移除了 Basic 计划的占位符 div */}

                <div className="flex-grow border-t border-muted/30 pt-6">
                  <ul className="space-y-4">
                    {Array.isArray(features) &&
                      features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check
                            className={`w-5 h-5 mr-3 flex-shrink-0 ${
                              plan.popular
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span className="text-sm text-foreground">
                            {feature}
                            {plan.key === "ultimate" &&
                              (feature.includes("Multi-to-multi generation") ||
                                feature.includes("多图批量生成")) && (
                                <span className="ml-2 bg-primary/20 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                                  {t("newTag")}
                                </span>
                              )}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
