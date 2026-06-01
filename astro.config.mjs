import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import vercel from '@astrojs/vercel/serverless';
import sitemap from '@astrojs/sitemap';

// In hybrid/server output mode the sitemap integration cannot auto-discover
// routes, so we provide them explicitly via customPages.
const SITE = 'https://jerg.studio';

export default defineConfig({
  site: SITE,
  output: 'hybrid',
  adapter: vercel(),
  integrations: [
    tailwind(),
    icon(),
    sitemap({
      customPages: [
        `${SITE}/`,
        `${SITE}/privacidad/`,
        `${SITE}/terminos/`,
      ],
      filter: (page) => page.startsWith(SITE),
    }),
  ],
});
