---
title: Installing Nemo
---

Nemo can be obtained as a precompiled binary, as a nix flake or built from source. Note that precompiled binaries might not be available for all platforms.

## Obtaining binaries

The Nemo Rule Engine is available as a precompiled binary for Windows, Linux, and macOS. You can download the latest version from the [Nemo releases page](https://github.com/knowsys/nemo/releases).
The linux version depends on `libssl` and `libcrypto`, which are usually installed by default on most distributions
(for example via the `libssl3` package on Ubuntu or `openssl` on Fedora).

## Using the Nix flake

Nemo is also available as a package for the
[nix](https://nixos.org/manual/nix/stable/) package manager. This allows several different ways of using it. For example, you can directly run Nemo without installing it:

```bash
nix run github:knowsys/nemo
```

Instead of running it directly, you can also just start a shell that has `nmo` in its path (again without installing it):

```bash
nix shell github:knowsys/nemo
```

The [nix flake](https://nixos.wiki/wiki/Flakes) also provides several other outputs, among it a **package** allowing you to add Nemo to, e.g., a system configuration or a [home-manager](https://github.com/nix-community/home-manager/). First, add Nemo a as a flake input:

```nix
{
  inputs = {
    nixpkgs.url = "…";
    nemo = {
      url = "github:knowsys/nemo";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

Then, you can, e.g., add Nemo to a system configuration to have it installed permanently, where `system` is the appropriate system type, e.g., `x86_64-linux`.

```toml
environment.systemPackages = [ nemo.packages."system".nemo ];
```

There is also an **overlay** that can be applied to a `nixpkgs` instance:

```toml
nixpkgs.overlays = [ nemo.overlays.default ];
environment.systemPackages = [ pkgs.nemo ];
```

We also provide the [[Python|Python integration]] and [[Javascript|Browser integration]] bindings as flake outputs (`packages.*.nemo-python`, `packages.*.nemo-wasm`). There are even `pypthon` and `nodejs` packages that have the respective bindings available, so you can, e.g., run a `python` interpreter with Nemo bindings by executing

```bash
nix run github:knowsys/nemo#python3
```

and, similarly, a `nodejs` interpreter with Nemo bindings by executing

```bash
nix run github:knowsys/nemo#nodejs
```

As with the main Nemo package, you can also start a shell with these interpreters in the path or add them to, e.g., a system configuration.

Lastly, for development on Nemo, the flake provides a **devShell** that has an appropriate rust toolchain and `rust-analyzer` in its path. From the source directory, run:

```bash
nix develop
```

## Building from source

To build your own version from source, you need to have an up-to-date installation of (nightly) Rust.
You can ensure you are on the latest version by running:

```bash
rustup update nightly
```

Moreover, Nemo requires the following dependency on Linux/Unix systems:

- OpenSSL development packages (e.g., libssl-dev on Ubuntu or openssl-devel on Fedora)

Download the source code (from a release or this repository) and run

```bash
cargo build -r
```

This will create the command-line client nmo in the directory `./target/release/`.
