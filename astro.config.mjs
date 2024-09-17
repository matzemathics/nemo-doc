import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import tailwind from "@astrojs/tailwind";
import { favicons } from "favicons";

const base = "/nemo-doc";

async function faviconPlugin(options) {
  const icons = await favicons("./logo/build/without-text/nemo-logo-rusty-nomargin.svg", options);
  return {
    name: "vite-plugin-favicons",
    order: "pre",
    sequential: true,
    transform(src, id) {
      if (id.endsWith("@astrojs/starlight/components/Page.astro")) {
        src = src.replace("</head>", icons.html.join("") + "</head>");
      }
      return src;
    },
    configureServer(server) {
      for (const icon of icons.images) {
        server.middlewares.use(`/${icon.name}`, (req, res) => {
          res.end(icon.contents);
        });
      }
    },
    generateBundle(options, bundle) {
      for (const icon of icons.images) {
        bundle[icon.name] = {
          type: "asset",
          fileName: icon.name,
          source: icon.contents,
        };
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://knowsys.github.io/",
  base,
  outDir: "./dist/nemo-doc",
  integrations: [
    starlight({
      title: "Nemo Rule Engine",
      logo: {
        dark: "./src/assets/nemo-logo-rusty-bright-nomargin.svg",
        light: "./src/assets/nemo-logo-rusty-nomargin.svg",
      },
      customCss: ["./src/tailwind.css"],
      social: {
        github: "https://github.com/knowsys/nemo",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Installing", slug: "guides/installing" },
            { label: "Command Line", slug: "guides/cli" },
            { label: "Rule Language", slug: "guides/tour" },
            { label: "Browser Integration", slug: "guides/wasm" },
            { label: "Python API", slug: "guides/python" },
          ],
        },
        {
          label: "Language Reference",
          // todo: reorder
          autogenerate: { directory: "reference" },
        },
      ],
    }),
    tailwind(),
  ],
  vite: {
    plugins: [
      faviconPlugin({
        path: base,
        background: "#134e4a",
        icons: {
          favicons: [
            "favicon.svg",
            "favicon.ico",
            "favicon-16x16.png",
            "favicon-32x32.png",
            "favicon-48x48.png",
          ],
          android: false,
          appleIcon: true,
          appleStartup: false,
          windows: false,
          yandex: false,
        },
      }),
    ],
  },
});
