import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute['robots'] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lhamsdj.com';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/vendor/', '/profile/', '/cart', '/checkout', '/payment/'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
