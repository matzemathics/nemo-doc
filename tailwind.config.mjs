/** @type {import('tailwindcss').Config} */
import starlightPlugin from '@astrojs/starlight-tailwind';
import colors from 'tailwindcss/colors';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: {
          '900': '#0e4453',
          '800': '#2a768a',
          '700': '#326679',
          '600': '#44798b',
          '500': '#558ba0',
          '400': '#6ca0ae',
          '300': '#85b0bc',
          '200': '#9fc2ca',
          '100': '#bad0d8',
          '50': '#d4e3e6',
        },
      },
    },
  },
  plugins: [starlightPlugin()],
}
