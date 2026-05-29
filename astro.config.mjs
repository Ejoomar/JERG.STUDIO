import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://jerg.studio',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [tailwind(), icon()],
});
