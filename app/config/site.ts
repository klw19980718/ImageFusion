import { getLocale } from "next-intl/server";
// 根据locale获取站点名称
const getSiteName = async () => {
  const locale = await getLocale();
  return locale === "zh" ? "AI图像融合" : "AI Image Fusion";
};
// 根据locale获取站点描述
const getSiteDescription = async () => {
  const locale = await getLocale();
  return locale === "zh" ? "AI图像融合" : "AI Image Fusion";
};
const siteConfig = {
  name: getSiteName(),
  description: getSiteDescription(),
  url: "https://imgfusion.com",
  logo: "/logo.png",
};
export default siteConfig;
