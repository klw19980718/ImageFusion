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

export default ImgFusionTemplate;
