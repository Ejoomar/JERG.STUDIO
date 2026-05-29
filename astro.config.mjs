import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://jerg.studio',
  output: 'static',
  adapter: vercel(),
  integrations: [tailwind(), icon()],
});
