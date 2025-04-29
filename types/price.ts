// 定义 Plan 结构
interface PricingPlan {
  key: "basic" | "premium" | "ultimate";
  priceId: string;
  popular: boolean;
}

export default PricingPlan;
