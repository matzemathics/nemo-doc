/** @type {import('tailwindcss').Config} */
import starlightPlugin from '@astrojs/starlight-tailwind';
import colors from 'tailwindcss/colors';

const nemo_blue = {
  '950': '#0c2227',
  '900': '#18434e',
  '600': '#2a768a',
  '200': '#8cbfcc',
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        nemo_blue,
        rust: '#9c6f30',
        accent: nemo_blue,
      },
    },
  },
  plugins: [starlightPlugin()],
}
