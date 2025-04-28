'use client';

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
          How to Use AI Image Fusion?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="bg-card p-8 rounded-standard shadow-custom border border-muted/20 hover-scale">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-primary font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Upload Images You Want to Combine</h3>
            <p className="text-muted-foreground">
              Upload the images you want to use. Make sure to use high-quality images for the very best AI Image Fusion results.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-card p-8 rounded-standard shadow-custom border border-muted/20 hover-scale">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-primary font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Choose a Style or Upload Your Reference</h3>
            <p className="text-muted-foreground">
              Now you can choose a premade style, or better yet, upload your own image as a reference.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-card p-8 rounded-standard shadow-custom border border-muted/20 hover-scale">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-primary font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Check and Download Your AI Image Fusion</h3>
            <p className="text-muted-foreground">
              Instantly check out the high-quality fused results. If you like what you see on preview, simply download your brand new, bespoke image to your device.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 