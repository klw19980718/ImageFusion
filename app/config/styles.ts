type styleType =
  | "Magical Princess"
  | "Future Vivid Fashion"
  | "Rainbow Vivid Illustration"
  | "Fantasy Golden Radiance"
  | "Renaissance"
  | "Armour"
  | "Soft beauty"
  | "Beautiful elf";

interface ImgFusionTemplate {
  id: number;
  name: styleType;
  description: string;
  imageSrc: string;
  prompt: string;
  demo: {
    sourceImageSrc: string;
    resultImageSrc: string;
  };
}
const imgFusionTemplates: ImgFusionTemplate[] = [
  {
    id: 1,
    name: "Magical Princess",
    description: "imgFusionTemplate1Description",
    imageSrc: "/images/templates/Magical Princess/style.jpg",
    prompt:
      "把图一的人物融入图二的风格，人物姿势、五官、表情不变，发型、妆容、服装造型使用图二的风格。直接出超拟真细节版本图片。",
    demo: {
      sourceImageSrc: "/images/templates/Magical Princess/source.jpg",
      resultImageSrc: "/images/templates/Magical Princess/result.jpg",
    },
  },
  {
    id: 2,
    name: "Future Vivid Fashion",
    description: "imgFusionTemplate1Description",
    imageSrc: "/images/templates/Future Vivid Fashion/style.jpg",
    prompt:
      "把图一的人物融入图二的风格，人物姿势、五官、表情不变，发型、妆容、服装造型使用图二的风格。直接出超拟真细节版本图片。",
    demo: {
      sourceImageSrc: "/images/templates/Future Vivid Fashion/source.jpg",
      resultImageSrc: "/images/templates/Future Vivid Fashion/result.jpg",
    },
  },
  {
    id: 2,
    name: "Rainbow Vivid Illustration",
    description: "imgFusionTemplate1Description",
    imageSrc: "/images/templates/Rainbow Vivid Illustration/style.jpg",
    prompt:
      "把图一的人物融入图二的风格，人物姿势、五官、表情、发型长度不变，头发颜色、妆容、服装风格造型使用图二的风格。直接出超拟真细节版本图片。",
    demo: {
      sourceImageSrc: "/images/templates/Rainbow Vivid Illustration/source.jpg",
      resultImageSrc: "/images/templates/Rainbow Vivid Illustration/result.jpg",
    },
  },
  {
    id: 3,
    name: "Fantasy Golden Radiance",
    description: "imgFusionTemplate1Description",
    imageSrc: "/images/templates/Fantasy Golden Radiance/style.jpg",
    prompt:
      "把图一的人物融入图二的风格，人物姿势、五官、表情、发型不变，头发颜色、妆容、服装风格、造型、头饰、项链等使用图二的风格。直接出超拟真细节版本图片。",
    demo: {
      sourceImageSrc: "/images/templates/Fantasy Golden Radiance/source.jpg",
      resultImageSrc: "/images/templates/Fantasy Golden Radiance/result.jpg",
    },
  },
  {
    id: 4,
    name: "Renaissance",
    description: "imgFusionTemplate1Description",
    imageSrc: "/images/templates/Renaissance/style.png",
    prompt:
      "把图一的人物融入图二的文艺复兴的风格，人物、五官、表情、发型不变，背景、姿势、头发颜色、妆容、服装风格造型使用图二的风格。直接出超拟真细节版本图片。",
    demo: {
      sourceImageSrc: "/images/templates/Renaissance/source.jpg",
      resultImageSrc: "/images/templates/Renaissance/result.jpg",
    },
  },
  {
    id: 5,
    name: "Armour",
    description: "imgFusionTemplate1Description",
    imageSrc: "/images/templates/Armour/style.png",
    prompt:
      "请把图二的盔甲穿到图一的角色身上，呈现全身战甲。",
    demo: {
      sourceImageSrc: "/images/templates/Armour/source.jpg",
      resultImageSrc: "/images/templates/Armour/result.jpg",
    },
  },
  {
    id: 6,
    name: "Soft beauty",
    description: "imgFusionTemplate1Description",
    imageSrc: "/images/templates/Soft beauty/style.png",
    prompt:
      "参考图二的图像风格，把图一用柔和、旋绕且渐隐的笔触创作精美的艺术作品，绘制奇幻的肖像画，确保图一的角色的五官、表情不能改变。",
    demo: {
      sourceImageSrc: "/images/templates/Soft beauty/source.jpg",
      resultImageSrc: "/images/templates/Soft beauty/result.jpg",
    },
  },
  {
    id: 7,
    name: "Beautiful elf",
    description: "imgFusionTemplate1Description",
    imageSrc: "/images/templates/Beautiful elf/style.png",
    prompt:
      "把图一中的人物变成精灵，黑色服装、银白色头发、精灵耳朵，背景为黄昏的森林，细节参考图二，请直接出高清、超写实的图。",
    demo: {
      sourceImageSrc: "/images/templates/Beautiful elf/source.jpg",
      resultImageSrc: "/images/templates/Beautiful elf/result.jpg",
    },
  },
];

export default imgFusionTemplates;
