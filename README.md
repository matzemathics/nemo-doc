# Nemo Documentation
[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

This repository contains the sources for the documentation of the [Nemo rule engine](https://github.com/knowsys/nemo).
To read the documentation, please go to the official [Nemo documentation pages](https://knowsys.github.io/nemo-doc/).
The content of the main branch of this repository is automatically deployed at this place.

## Contributing

Found a typo? Want to suggest an improvement? We appreciate your contributions in two ways:
- [Report an issue](https://github.com/knowsys/nemo-doc/issues) in this repository
- Implement a change in the sources and create a pull request

## Building this Documentation

Contributors who want to create the documentation on their own machine (e.g., for preview)
can use the following commands. All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
