'use client';

export default function BenefitsSection() {
  return (
    <section className="py-20 px-6 bg-card">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
          Discover Benefits of AI Image Fusion
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground pb-2 border-b border-primary/30">
              Enhanced Creativity with AI Image Fusion
            </h3>
            <p className="text-muted-foreground">
              AI Image Fusion combines diverse elements, helping artists and designers create imaginative visuals that are hard to achieve manually. For marketers, it ensures visual consistency across materials by applying uniform styles and elements.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground pb-2 border-b border-primary/30">
              Combine Images in a Snap
            </h3>
            <p className="text-muted-foreground">
              Combining images manually is a case of extensive layering and advanced editing techniques. Let's get rid of that and do it all for you with AI Image Fusion and a few clicks.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground pb-2 border-b border-primary/30">
              Customization and Flexibility
            </h3>
            <p className="text-muted-foreground">
              Get experimental with your choices and combinations. Simply upload and combine different styles to explore a wide range of creative possibilities. It's an enjoyable way to discover unique, merged visuals.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground pb-2 border-b border-primary/30">
              Create Unique Images from Stock Photos
            </h3>
            <p className="text-muted-foreground">
              With AI Image Fusion, you can create unique and novel visuals that stand out from standard stock images or graphics. Experiment with various choices and combinations to explore endless creative possibilities and achieve truly distinctive results.
            </p>
          </div>

          {/* Benefit 5 */}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground pb-2 border-b border-primary/30">
              AI Image Fusion is Cost-Effective
            </h3>
            <p className="text-muted-foreground">
              By reducing the need for extensive manual editing or hiring multiple specialists, AI image combiners can be a more cost-effective solution for creating high-quality images.
            </p>
          </div>

          {/* Benefit 6 */}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground pb-2 border-b border-primary/30">
              Get Inspiration from AI Image Fusion
            </h3>
            <p className="text-muted-foreground">
              Upload different style images, and AI Image Fusion will transform your source image into different artistic versions. Get inspired by seeing your image turn to countless unique styles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 