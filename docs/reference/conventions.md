---
title: Conventions
description: Naming, project tags and module-boundary rules for core, plugin and client code.
scope: ecosystem
tags: [conventions, naming, nx, eslint]
order: 2
decisions: ["0012", "0007", "0031", "0032", "0038"]
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
- **Type suffixes in use:** `model`, `service`, `schema`, `types`, `config`, `seed`, `registry`, `routes`, `middleware`, `api`, `context`, `component`, `hook`, `styles`, `slice`, `spec` (tests, e.g. `pages.spec.ts`), `setup` (Vitest setup files in the test kit), `extension` (TipTap extensions, e.g. `rich-text-style.extension.ts`). A new suffix is added to this list in the same change that first uses it.
- **Unused parameters:** prefix a parameter with `_` when its position is required but its value isn't (e.g. `_req`, or `_next` in an Express error handler, which Express only recognises by its four parameters). ESLint ignores `_`-prefixed parameters.
- Files whose names a tool requires (`main.ts`, `index.ts`, `project.json`, `vite.config.mts`, `vitest.config.mts`, `tsconfig*.json`) keep those names. `core/vitest.preset.mts` is the shared Vitest preset.

## Building UI

Build screens, pages and layouts from the UI library's components and composites: Container (with `as` for semantic elements) rather than a `<div>`, Text rather than a `<p>`, and so on ([0092](../decisions/0092-build-ui-from-the-library-before-plain-elements.md)). Plain HTML elements are a last resort, for what no component can express. Today that means a `<form>`, a value style props can't take (a `calc()` height, a raw hex swatch), or a component's own internals, and each one says why in a comment. If a component almost fits, extend its props instead.

Pages are full width by default; don't cap them at a maximum width unless the design calls for it ([0091](../decisions/0091-make-pages-full-width-by-default.md)).

## Theme colours

The UI library isn't built yet, but these rules already apply to anything designed for it: core screens, plugin UIs and generated pages. See [0031](../decisions/0031-theme-colour-tokens-and-scales.md) and [0032](../decisions/0032-dark-mode-mirrors-the-theme-scales.md).

- **Tokens:** `primary`, `secondary`, `tertiary`, `quaternary`, `accent`, `surface`, each on a 50–950 scale.
- **Surface roles:**

  | Steps | Use for |
  | --- | --- |
  | 50–400 | Backgrounds |
  | 500 | Borders and dividers |
  | 600–950 | Text |

  Any text step is readable on any background step, so pick by look, not by contrast checking.
- **Dark mode mirrors every scale** (50↔950, 100↔900, 200↔800, 300↔700, 400↔600, 500 stays). Follow the roles above and UI flips correctly with no extra work. Don't use fixed colours (e.g. Tailwind `white` or `gray-900`) for anything that should follow the mode.

## Tags and module boundaries

Every lib has one tag from each of `scope:`, `type:` and `origin:`; UI libs also have a `ui:` tag. Apps carry only their `scope:` tag. `@nx/enforce-module-boundaries` enforces the rules in `core/eslint.config.mjs`.

| Group | Values | Meaning |
| --- | --- | --- |
| `scope:` | `api`, `web`, `cms`, `docs`, `shared` | Which app(s) may consume it. `shared` is usable by all; `docs` is the manual viewer. |
| `type:` | `feature`, `data-access`, `ui`, `util`, `testing` | Its role in the layering. `testing` marks a test kit, for spec files only ([0103](../decisions/0103-test-with-vitest-and-a-plugin-contract-kit.md)). |
| `origin:` | `core`, `plugin`, `client` | Where it came from. |
| `ui:` | `theme`, `component`, `composite`, `layout` | UI libs only: the UI layer ([0038](../decisions/0038-split-the-ui-library-into-four-libs-with-layer-tags.md)). |

| A project tagged | May depend only on |
| --- | --- |
| `scope:api` / `scope:web` / `scope:cms` | Its own scope and `scope:shared` |
| `scope:docs` | `scope:docs`, `scope:shared` |
| `scope:shared` | `scope:shared` |
| `type:feature` | Any type |
| `type:data-access` | `data-access`, `util` (and `testing`, from its specs) |
| `type:ui` | `ui`, `util` (and `testing`, from its specs) |
| `type:util` | `util` (and `testing`, from its specs) |
| `type:testing` | Any type |
| `origin:core` | Never `origin:plugin` or `origin:client` |
| `ui:theme` | No other `ui:` lib |
| `ui:component` | `ui:theme` (not composites or layouts) |
| `ui:composite` | `ui:component`, `ui:theme` (not layouts) |

Only app registry files import plugin or client libs. Only `*.spec.ts(x)` files import test kits (`@inithium/*-testing*`), which `no-restricted-imports` enforces; the kits' own configs turn the rule off. Fix a boundary error by changing the dependency, never with an `eslint-disable` comment.
