import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute['manifest'] {
  return {
    name: 'LhamsDJ Marketplace',
    short_name: 'LhamsDJ',
    description: 'Your global marketplace',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111827',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
