---
id: "0013"
title: Override outdated Nx generator defaults
status: accepted
date: "2026-10-07"
scope: core
tags: [nx, vite, tooling, npm]
related: ["0007", "0011"]
supersedes: []
---

# 0013. Override outdated Nx generator defaults

## Context

Nx 23's generators produce output that doesn't match the current toolchain. They still emit the deprecated `nxViteTsPaths` and `nxCopyAssetsPlugin` Vite plugins, plus placeholder files and READMEs, and they don't set up ESLint flat config or Tailwind the way the workspace needs.

## Decision

- Vite resolves `@inithium/*` path aliases natively with `resolve.tsconfigPaths: true`. Strip `nxViteTsPaths` and `nxCopyAssetsPlugin` from anything newly generated, and don't add `vite-tsconfig-paths`.
- Delete the placeholder file and README that the lib generators create.
- Every new project gets an `eslint.config.mjs` that spreads the root config (React projects also add `nx.configs['flat/react']`).
- `core/.npmrc` sets `legacy-peer-deps=true`.

## Alternatives considered

None recorded. Rationale for `legacy-peer-deps` not recorded: which peer-dependency conflict it works around hasn't been written down yet.

## Consequences

- Generated code always needs a clean-up pass. The steps are listed in [Commands](../reference/commands.md).
- `legacy-peer-deps` stays until the conflict behind it is identified and resolved.
