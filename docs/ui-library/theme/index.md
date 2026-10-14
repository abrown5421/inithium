---
title: Theme
description: The six colour tokens, how their scales are generated, surface roles, dark mode, fonts and the theme API.
scope: core
tags: [ui, theme, colour, typography]
order: 2
decisions: ["0031", "0032", "0041", "0046", "0101"]
---

# Theme

The theme is the single source of truth for branding: six colour tokens and two font families.

## Colour tokens

Six tokens, each on an 11-step scale (50, 100, 200 … 900, 950), generated in OKLCH so the steps look even ([0031](../../decisions/0031-theme-colour-tokens-and-scales.md), [0041](../../decisions/0041-generate-theme-scales-in-oklch.md)). A client sets one colour per token; every other step is generated.

| Token | Client sets | Core default |
| --- | --- | --- |
| `primary` | 500 | `#006a8e` |
| `secondary` | 500 | `#397e7f` |
| `tertiary` | 500 | `#64748b` |
| `quaternary` | 500 | `#25374f` |
| `accent` | 500 | `#f5a42d` |
| `surface` | 100 | `#f8fafc` |

- The client's colour is exactly the 500 (brand tokens) or 100 (surface) step.
- **Clients set them in the CMS's Settings** as hex codes, with a live preview of each scale ([0087](../../decisions/0087-set-theme-colours-in-cms-settings.md)). Both `web` and the CMS render that theme over `UiProvider`'s default once settings load; without one, core's defaults apply.
- **Surface must be light enough:** its generated text steps (600–950) have to meet WCAG AA against its backgrounds, so a dark surface (e.g. `#006a8e`) can't be used; `generateSurfaceScale` throws for one. `themeColorProblem(token, hex)` returns the reason (or null) without throwing, and the CMS shows it on the field. `ThemeStyles` falls back to the default theme, with a console warning, if a stored theme can't be generated, so a bad value never breaks an app.
- **Default logo:** `defaultLogo` (`{ src, alt: 'Inithium' }`, a 178 × 160 PNG bundled from `libs/shared/ui-theme/src/assets/`) is shown wherever the site has no logo in settings.
- **Default favicon:** each app's `public/favicon.ico` (`web`, the CMS and the docs app) is Inithium's logo at 16, 32, 48 and 64 px, shown wherever the site has no favicon in settings ([0101](../../decisions/0101-set-the-favicon-from-an-uploaded-asset.md)). If the logo changes, regenerate it from `inithium-logo.png` and replace all three.
- Every step is published as a CSS variable, `--color-<token>-<step>` (e.g. `--color-primary-200`).
- Colour props use them through a [colour value](../style-props.md#colour-value), e.g. `{ color: 'primary', intensity: 200 }`.
- There are no status tokens (success, warning …). Use these six or Tailwind's colours.

## Surface roles

`surface` colours backgrounds and body text, in fixed roles:

| Steps | Use for |
| --- | --- |
| 50–400 | Backgrounds |
| 500 | Borders and dividers |
| 600–950 | Text |

The generator guarantees every text step meets WCAG AA (4.5:1) on every background step; the weakest pair, 600 on 400, is the one it solves for. A surface colour too dark for that is rejected with an error.

## Dark mode

Not built yet. When it is, every scale mirrors around 500 (50↔950, 100↔900, 200↔800, 300↔700, 400↔600; 500 stays). UI that follows the surface roles flips correctly with no extra code ([0032](../../decisions/0032-dark-mode-mirrors-the-theme-scales.md)). Don't use fixed colours (e.g. Tailwind `neutral-50`) for anything that should follow the mode.

## Fonts

Two families ([0046](../../decisions/0046-theme-fonts-display-and-body.md)):

| Family | Use | Default font | Weights | CSS variable |
| --- | --- | --- | --- | --- |
| `display` | Branding, logo-style headings | Bruno Ace SC | 400 only | `--font-display` |
| `body` | Everything else (the page default) | Merriweather Sans | 300–800 (variable) | `--font-body` |

- Select a family with Text's [`fontFamily`](../components/text.md) prop.
- A heavier weight on `display` is synthesised by the browser.
- Both defaults use the SIL Open Font License 1.1. Their licences ship beside the font files in `libs/shared/ui-theme/src/fonts/` (`display-ofl.txt`, `body-ofl.txt`), so every client clone carries them.
- "Merriweather" is a Reserved Font Name: a modified copy, such as these web fonts, can't be offered under it. That's one reason the families are exposed as `Inithium Display` and `Inithium Body`.
- Clients will be able to replace either font by uploading their own once assets exist.

## Examples

### Example: Every scale

All six tokens with their 11 generated steps.

```example
ui-library/theme/scales
```

### Example: Surface roles

Every text step (600–950) on every background step (50–400): all readable.

```example
ui-library/theme/surface-roles
```

### Example: Fonts

The display family, and the body family at each weight it covers.

```example
ui-library/theme/fonts
```

## API

From `@inithium/shared-ui-theme`:

| Export | Description |
| --- | --- |
| `defaultTheme` | Core's default `ThemeConfig` (the table above). |
| `ThemeStyles` | Renders the theme's `--color-*` variables. `UiProvider` renders it for you. Prop: `theme?: ThemeConfig`. |
| `useFavicon(href?)` | Points the page's icon link at the site's favicon, or back at the app's default without one ([0101](../../decisions/0101-set-the-favicon-from-an-uploaded-asset.md)). `web`'s shell and the CMS's `CmsTheme` call it. |
| `generateBrandScale(hex500)` | A brand token's 11-step scale, as hex values. |
| `generateSurfaceScale(hex100)` | The surface scale. Throws if no text band could meet the contrast guarantee. |
| `generateThemeScales(theme)` | All six scales. |
| `themeToCss(theme)` | The `:root { --color-… }` CSS. |
| `contrastRatio(hexA, hexB)` | WCAG contrast ratio, 1–21. |

From `@inithium/shared-contracts`: `themeConfigSchema` and its type `ThemeConfig`.

```ts
const theme: ThemeConfig = {
  colors: {
    primary: '#006a8e', secondary: '#397e7f', tertiary: '#64748b',
    quaternary: '#25374f', accent: '#f5a42d', surface: '#f8fafc',
  },
};
```

Each value is a 6-digit hex colour.
