---
title: UI library
description: How the UI library is organised, how to set it up in an app, and where each part is documented.
scope: core
tags: [ui, setup, components]
order: 4
decisions: ["0030", "0037", "0038", "0039", "0047", "0052", "0053"]
---

# UI library

Every screen in `web`, `cms` and plugin UIs is built from one shared UI library, styled entirely through typed props, with no `className` or `style` ([0037](../decisions/0037-style-components-only-through-typed-props.md)).

## Layers

The library has four layers. Each builds only on the layers above it, and lint enforces this ([0030](../decisions/0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md), [0038](../decisions/0038-split-the-ui-library-into-four-libs-with-layer-tags.md)).

| Layer | Lib | What it holds | Built so far |
| --- | --- | --- | --- |
| Theme | `@inithium/shared-ui-theme` | Colour tokens, scale generation, fonts | [Theme](theme/index.md) |
| Components | `@inithium/shared-ui-components` | Single-purpose building blocks (atoms) | [Container](components/container.md), [Icon](components/icon.md), [Text](components/text.md) |
| Composites | `@inithium/shared-ui-composites` | Components combined into molecules (modal, tabs, …) | Not created yet |
| Layouts | `@inithium/shared-ui-layouts` | Page-level structures (organisms) | Not created yet |

The prop schemas and types live in `@inithium/shared-contracts` ([0039](../decisions/0039-keep-style-prop-schemas-in-shared-contracts.md)), so the API and plugins can validate stored props without React.

## In this section

| Page | Covers |
| --- | --- |
| [Theme](theme/index.md) | The six colour tokens and their scales, surface roles, dark mode, fonts, and the theme API |
| [Style props](style-props.md) | Every prop shape shared by components: colours, sides, sizes, radius, variant keys |
| [Animation](animations/index.md) | The `animation` prop, `show`, `replay`, stagger and every available animation |
| `components/` | One page per component, with every prop it accepts |
| `composites/`, `layouts/` | One page per composite and layout, as they're built |

Every component, composite and layout has its own page ([0052](../decisions/0052-keep-a-self-documenting-developer-manual.md)).

## Live examples

In the docs app (`npx nx serve docs`, http://localhost:5175), every example on these pages renders live above its exact source ([0053](../decisions/0053-view-the-manual-in-a-docs-app.md)). Examples are files in `core/apps/docs/src/examples/`, each default-exporting one component, embedded in a page with a fenced `example` block:

````markdown
```example
ui-library/<component>/<name>
```
````

## Setting up an app

Each app's `src/styles.css`:

```css
@import "tailwindcss" theme(static);
@import "../../../libs/shared/ui-theme/src/styles/theme.css";
@import "animate.css";
@source "../../../libs";
```

| Line | Why |
| --- | --- |
| `theme(static)` | Makes Tailwind emit every palette variable (`--color-emerald-200`, …). Colour props read them at runtime; without it, Tailwind colours resolve to nothing. |
| `theme.css` | Declares the theme fonts. |
| `animate.css` | The animations used by the `animation` prop. |
| `@source` | Lets Tailwind see classes used in libs. |

Then wrap the app root in `UiProvider`:

```tsx
import { UiProvider } from '@inithium/shared-ui-components';

<UiProvider theme={optionalThemeConfig}>
  <App />
</UiProvider>
```

### `UiProvider`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `theme` | `ThemeConfig` | `defaultTheme` | The client's theme: each brand token's 500 and surface's 100, as hex. See [Theme](theme/index.md). |
| `children` | `ReactNode` | none | The app. |

It renders two `<style>` elements: the theme's colour variables (`--color-<token>-<step>`), and one stylesheet holding the fixed CSS of components that need it (currently [Checkbox](components/checkbox.md)'s, [Divider](components/divider.md)'s, [Input](components/input.md)'s, [Loader](components/loader.md)'s and [Switch](components/switch.md)'s) followed by the rules every style prop relies on.

## How style props work

Props become fixed class names that read CSS variables set inline ([0047](../decisions/0047-generate-the-style-prop-stylesheet-from-a-property-table.md)):

```tsx
<Container bgColor="primary" />
// <div class="ui-bg" style="--ui-bg: var(--color-primary-500)">
```

The engine is in `libs/shared/ui-components/src/lib/style-props/`:

| File | Role |
| --- | --- |
| `style-properties.config.ts` | The property table: each entry is a class stem and the CSS properties it sets. |
| `style-sheet.service.ts` | Builds one rule per property per variant key, e.g. `.ui-bg-md-hover:hover { background-color: var(--ui-bg-md-hover) }`. |
| `style-props.service.ts` | Turns props into class names plus inline variables. |

**To add a style property:**

1. Add its schema to the props in `@inithium/shared-contracts`.
2. Add a table entry.
3. Resolve it in `style-props.service.ts`.
4. Document it on [Style props](style-props.md) and on every component page that accepts it.

## Not supported yet

- Ring and outline colours: they need width and style props first.
- CSS transitions, e.g. a hover colour fade.
- Horizontal centring with `margin: auto`, because margins are pixel numbers. Centre with the parent's `flex` instead.
- The remaining components, and all composites and layouts.
