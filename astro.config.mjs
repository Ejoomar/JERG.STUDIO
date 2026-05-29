import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import netlify from "@astrojs/netlify";

export default defineConfig({
  site: "https://astro-moon-landing.netlify.app/",
  output: "hybrid",
  adapter: netlify(),
  integrations: [tailwind(), icon()],
});
