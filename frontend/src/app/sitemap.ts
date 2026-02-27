import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lhamsdj.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default async function sitemap(): Promise<MetadataRoute['sitemap']> {
  const staticRoutes = [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  let productRoutes: MetadataRoute['sitemap'] = [];
  try {
    const res = await fetch(`${API_URL}/products?limit=1000`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success && data.data) {
      productRoutes = data.data.map((p: any) => ({
        url: `${BASE_URL}/product/${p.slug}`,
        lastModified: new Date(p.updatedAt || p.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {}

  let categoryRoutes: MetadataRoute['sitemap'] = [];
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success && data.data) {
      categoryRoutes = data.data.map((c: any) => ({
        url: `${BASE_URL}/products?category=${c.slug}`,
        lastModified: new Date(c.updatedAt || c.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {}

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
