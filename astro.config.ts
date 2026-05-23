// @ts-check
import { defineConfig, fontProviders } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  devToolbar: {
    enabled: false,
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Montserrat',
        cssVariable: '--font-montserrat',
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Source Sans Pro',
        cssVariable: '--font-source-sans-pro',
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
