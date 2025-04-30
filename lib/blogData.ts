// my-app/lib/blogData.ts
export interface BlogPostMeta {
  id: number;
  slug: string;
  category: 'tutorials' | 'updates' | 'stories';
  date: string;
}

export const blogPostMetadata: BlogPostMeta[] = [
  { id: 1, slug: 'how-to-take-perfect-polaroid-style-photos', category: 'tutorials', date: '2025-04-30' },
  { id: 2, slug: 'new-feature-3d-effect-enhancement', category: 'updates', date: '2025-04-30' },
  { id: 3, slug: 'user-story-wedding-photos-to-creative-souvenirs', category: 'stories', date: '2025-04-30' },
  { id: 4, slug: 'history-and-charm-of-polaroid-style', category: 'tutorials', date: '2025-04-29' },
  { id: 5, slug: '5-creative-ways-to-display-polaroid-photos', category: 'tutorials', date: '2025-04-29' },
  { id: 6, slug: 'performance-optimization-update-faster-processing', category: 'updates', date: '2025-04-29' }
]; 