---
title: Conventions
description: Naming, project tags and module-boundary rules for core, plugin and client code.
scope: ecosystem
tags: [conventions, naming, nx, eslint]
order: 4
decisions: ["0012", "0007"]
---

# Conventions

## Naming

| What | Pattern | Examples |
| --- | --- | --- |
| Directories | kebab-case, all lowercase | `user-profile/`, `plugin-ecom/` |
| Backend modules | `[entity].[type].ts` | `users.model.ts`, `users.service.ts`, `ecom.seed.ts` |
| Frontend modules | `[entity]-[purpose].[type].tsx` | `user-search-input.component.tsx`, `use-users.hook.ts` |
| Zod schemas | `[entity].schema.ts` | `users.schema.ts` |
| Types and interfaces | `[entity].types.ts` | `users.types.ts` |
| Branches | `<type>/<kebab-name>` | `feat/user-collection`, `refactor/user-collection` |
| Decision records | `NNNN-kebab-title.md` | `0006-serve-each-client-from-one-origin.md` |

- **Plurality:** module-level files use the plural entity (`users.model.ts`, `use-users.hook.ts`). A unit that concerns a single instance uses the singular (`user-avatar.component.tsx`).
- **Type suffixes in use:** `model`, `service`, `schema`, `types`, `config`, `seed`, `registry`, `component`, `hook`. A new suffix is added to this list in the same change that first uses it.
- Files whose names a tool requires (`main.ts`, `index.ts`, `project.json`, `vite.config.mts`, `tsconfig*.json`) keep those names.

## Tags and module boundaries

Every lib has one tag from each group. Apps carry only their `scope:` tag. `@nx/enforce-module-boundaries` enforces the rules in `core/eslint.config.mjs`.

| Group | Values | Meaning |
| --- | --- | --- |
| `scope:` | `api`, `web`, `cms`, `shared` | Which app(s) may consume it. `shared` is usable by all. |
| `type:` | `feature`, `data-access`, `ui`, `util` | Its role in the layering. |
| `origin:` | `core`, `plugin`, `client` | Where it came from. |

| A project tagged | May depend only on |
| --- | --- |
| `scope:api` / `scope:web` / `scope:cms` | Its own scope and `scope:shared` |
| `scope:shared` | `scope:shared` |
| `type:feature` | Any type |
| `type:data-access` | `data-access`, `util` |
| `type:ui` | `ui`, `util` |
| `type:util` | `util` |
| `origin:core` | Never `origin:plugin` or `origin:client` |

Only app registry files import plugin or client libs. Fix a boundary error by changing the dependency, never with an `eslint-disable` comment.
