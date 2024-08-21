import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import { visit } from 'unist-util-visit';

const updateLinks =
  function (tree) {
    if (!tree) return;
    visit(tree, 'element', function (node, index, parent) {
      if (
        node.tagName === 'a' &&
        typeof node.properties.href === 'string' &&
        is(node, index, parent)
      ) {
        console.log(url)
        if (url.startsWith("/")) {
          const url = node.properties.href
          node.properties.href = "/nemo-docs-unofficial.github.io" + url;
        }
      }
    })
  };

// https://astro.build/config
export default defineConfig({
  site: 'https://matzemathics.github.io/nemo-docs-unofficial.github.io/',
  base: '/nemo-docs-unofficial.github.io',
  outDir: './dist/nemo-docs-unofficial.github.io',

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
  markdown: {
    rehypePlugins: [updateLinks]
  }
});
