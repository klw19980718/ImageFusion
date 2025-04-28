'use client';

import Image from 'next/image';

export default function UseCasesSection() {
  return (
    <section className="py-20 px-6 bg-card">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
          Explore What You Can Do with AI Image Fusion
        </h2>

        {/* Case 1 */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 md:order-1">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              Create Cool Portraits with AI Image Fusion for Social Media
            </h3>
            <p className="text-muted-foreground">
              With AI Image Fusion, you can fuse traditional portraits with abstract patterns or textures to create visually striking artworks. The combination of realistic human features with abstract designs adds depth and emotion, offering a fresh take on portrait art.
            </p>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-standard overflow-hidden shadow-custom hover-scale">
              <Image
                src="/examples/a1.png"
                alt="AI Portrait Fusion"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Case 2 */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-standard overflow-hidden shadow-custom hover-scale">
              <Image
                src="/examples/a2.jpg"
                alt="AI Concept Art"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              Level Up Your Concept Art with AI Image Combiner
            </h3>
            <p className="text-muted-foreground">
              Create concept art creation for video games, movies, and other media by combining diverse elements and ideas. AI image fusion empowers creators to seamlessly blend textures, colors, and forms, sparking innovative designs for characters, environments, and props.
            </p>
          </div>
        </div>

        {/* Case 3 */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              Stylish Product Branding Images with AI Image Fusion
            </h3>
            <p className="text-muted-foreground">
              AI Image Fusion blends elements to craft visually striking and memorable images that stand out in the marketplace. By seamlessly combining textures, colors, and designs, AI Image Fusion creates compelling visuals that enhance your brand's identity and captivate your audience.
            </p>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-standard overflow-hidden shadow-custom hover-scale">
              <Image
                src="/examples/a3.png"
                alt="AI Brand Images"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 