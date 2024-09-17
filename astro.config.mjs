import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://knowsys.github.io/',
  base: '/nemo-doc',
  outDir: './dist/nemo-doc',
  integrations: [
    starlight({
      title: 'Nemo Rule Engine',
      logo: {
        dark: './src/assets/nemo-logo-rusty-bright-nomargin.svg',
        light: './src/assets/nemo-logo-rusty-nomargin.svg'
      },
      customCss: [
        './src/tailwind.css'
      ],
      social: {
        github: 'https://github.com/knowsys/nemo'
      },
      sidebar: [
        {
          label: 'Guides',
          items: [ // Each item here is one entry in the navigation menu.
            { label: 'Installing', slug: 'guides/installing' },
            { label: 'Command Line', slug: 'guides/cli' },
            { label: 'Rule Language', slug: 'guides/tour' },
            { label: 'Browser Integration', slug: 'guides/wasm' },
            { label: 'Python API', slug: 'guides/python' }
          ]
        },
        {
          label: 'Language Reference',
          // todo: reorder
          autogenerate: { directory: 'reference' }
        }
      ]
    }),
    tailwind()
  ]
});
