---
id: "0012"
title: Name files by entity and type
status: accepted
date: "2026-10-07"
scope: ecosystem
tags: [conventions, naming]
related: []
supersedes: []
---

# 0012. Name files by entity and type

## Context

Core, plugins and client code are all written to the same conventions, so a developer moving between them should be able to tell what a file contains from its name.

## Decision

- Backend modules are named `[entity].[type].ts` (`users.model.ts`), and frontend modules `[entity]-[purpose].[type].tsx` (`user-search-input.component.tsx`).
- Module-level files use the plural entity (`users.types.ts`); a unit that concerns a single instance uses the singular (`user-avatar.component.tsx`).
- Type suffixes come from a fixed list, which grows only by adding to it.
- Directories are kebab-case. Branches are `<type>/<kebab-name>`.

The full tables are in [Conventions](../reference/conventions.md).

## Alternatives considered

None recorded. This is the naming system the project owner has used for years and finds most readable.

## Consequences

- Tool-mandated file names (`main.ts`, `index.ts`, `project.json`, `vite.config.mts`, `tsconfig*.json`) are the exception and keep the names their tools expect.
- A new type suffix is added to the list in the same change that first uses it.
