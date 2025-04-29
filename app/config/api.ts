const baseApiUrl = "https://api.imagefusionai.com/api";

const siteSign = "aiPolatoons";

export const apiConfig = {
  baseApiUrl: baseApiUrl,
  userInfo: `${baseApiUrl}/${siteSign}/user/info`,
  userRegisterOrUpdate: `${baseApiUrl}/${siteSign}/user/registerOrUpdate`,
  stripeSubscriptionCreate: `${baseApiUrl}/stripe/subscription/create`,
  opusList: `${baseApiUrl}/${siteSign}/generateImageOpus/list`,
  priceList: `${baseApiUrl}/website/pricelist`,
};
