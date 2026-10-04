import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://uroref.com',
  redirects: {
    '/connect': '/nity',
    '/ecosystem': '/showcase',
  },
  integrations: [mdx(), sitemap()],
  vite: {
    build: { sourcemap: false, minify: 'esbuild' },
    plugins: [tailwindcss()],
  },
});
