type styleType =
  | "Magical Princess"
  | "Future Vivid Fashion"
  | "Rainbow Vivid Illustration"
  | "Fantasy Golden Radiance";

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
];

export default imgFusionTemplates;
