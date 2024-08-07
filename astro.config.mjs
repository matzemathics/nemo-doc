import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://matzemathics.github.io/nemo-docs-unofficial.github.io/',
  integrations: [
    starlight({
      title: 'Nemo Rule Engine',
      social: {
        github: 'https://github.com/knowsys/nemo',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Installing', slug: 'guides/installing' },
            { label: 'Command Line', slug: 'guides/cli' },
            { label: 'Rule Language', slug: 'guides/tour' },
            { label: 'Broser Integration', slug: 'guides/wasm' },
            { label: 'Python API', slug: 'guides/python' },
          ],
        },
        {
          label: 'Language Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
