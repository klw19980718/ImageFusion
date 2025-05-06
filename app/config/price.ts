import PricingPlan from "@/types/price";



// --- 恢复静态的 pricingPlans 数组，并加入 Basic ---
const pricingPlans: PricingPlan[] = [
  {
    key: "basic",
    priceId: "", // Basic 计划不可购买，Price ID 为空
    popular: false,
  },
  {
    key: "premium",
    priceId: "price_1RLhYO02vixuoLgQPU1RI4Hu",
    popular: true,
  },
  {
    key: "ultimate",
    priceId: "price_1RJ9Ig02vixuoLgQICFb9yQZ",
    popular: false,
  },
];

export default pricingPlans;
