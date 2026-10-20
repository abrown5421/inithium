---
title: Site settings
description: The single settings record that holds the site's title, logos, favicon, copyright holder, theme and dark mode switch, and its endpoints.
scope: core
tags: [api, settings, cms, branding]
order: 7
decisions: ["0082", "0087", "0098", "0101", "0119"]
---

# Site settings

Site-wide settings live in one record in the `settings` collection, in `@inithium/api-settings` ([0082](../decisions/0082-keep-site-wide-settings-in-one-record.md)). They give the Navbar its title and logo and the Footer its copyright holder, and the CMS edits them on its Settings screen.

## The record

Contracts are in `@inithium/shared-contracts` (`siteSettingsSchema`, type `SiteSettings`):

| Field | Type | Notes |
| --- | --- | --- |
| `siteTitle` | string, 1–100 | The Navbar title and the end of every document title. Default `Inithium`. |
| `logo` | `{ assetId, alt }`, optional | An uploaded image, by its [asset](assets.md) id, and its description ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)). `logoImage(logo)` gives the Navbar's `{ src, alt }`. Without one, `web` and the CMS show Inithium's default logo (`defaultLogo` from `@inithium/shared-ui-theme`). Its asset can't be deleted while it's the logo. |
| `logoDark` | `{ assetId, alt }`, optional | The logo in [dark mode](../ui-library/theme/dark-mode.md) ([0119](../decisions/0119-let-each-user-choose-light-or-dark-mode.md)). Without one, dark mode keeps `logo`, and with neither shows Inithium's `defaultLogoDark`; `siteLogo(settings, scheme)` from `@inithium/shared-ui-theme` picks. Its asset can't be deleted while it's the dark mode logo. |
| `favicon` | `{ assetId }`, optional | The browser-tab icon of `web` and the CMS: an uploaded ICO, PNG or SVG ([0101](../decisions/0101-set-the-favicon-from-an-uploaded-asset.md)). Without one, both show Inithium's default `favicon.ico` (the Inithium logo, bundled in each app). Its asset can't be deleted while it's the favicon. |
| `copyright` | string, 1–100, optional | The Footer's copyright holder. |
| `theme` | `{ colors: { primary, secondary, tertiary, quaternary, accent, surface } }`, optional | The theme as hex codes (`themeConfigSchema`): the brand tokens' 500s and surface's 100 ([0087](../decisions/0087-set-theme-colours-in-cms-settings.md)). Missing means core's default theme. |
| `fonts` | `{ display?, body? }`, optional | The theme's fonts (`themeFontsSchema`): the [font family](assets.md#font-families) id each role uses ([0111](../decisions/0111-keep-uploaded-font-families-in-a-library.md)). A role left out uses Inithium's default (Bruno Ace SC for `display`, Merriweather Sans for `body`). A family must be in the library and have at least one file (400 naming `fonts.display` or `fonts.body` otherwise). |
| `darkMode` | boolean | Whether visitors and users may use [dark mode](../ui-library/theme/dark-mode.md) ([0119](../decisions/0119-let-each-user-choose-light-or-dark-mode.md)). Optional in `PUT` (left out means on); always present in responses. Off draws everyone in light mode and hides the choice; users' stored preferences are kept. New sites are seeded with it on. |
| `updatedAt` | ISO date-time | |

SEO defaults come later. Logos saved as URLs before assets existed are dropped, so those sites show the default logo until one is chosen.

## Endpoints

| Endpoint | Who | Does |
| --- | --- | --- |
| `GET /api/site` | Anyone | Returns the settings with the published pages; see [Pages](pages.md#endpoints). |
| `GET /api/settings` | `settings.edit` | The settings. |
| `PUT /api/settings` | `settings.edit` | Replaces them with a `siteSettingsInputSchema` body; fields left out (`logo`, `logoDark`, `favicon`, `copyright`, `theme`, `fonts`) are cleared and `darkMode` left out is on, so leaving out `theme` returns the site to core's default colours and leaving out `fonts` to its default fonts. 400 with Zod `issues` if invalid. |

## Theme fonts in the page

`web` and the CMS draw with the theme's fonts from the first paint ([0114](../decisions/0114-load-the-clients-fonts-without-a-flash.md)):

- **The api writes the font rules into each app's `index.html`** when it serves it (`renderAppPage()`, `themeFontsHead()` in `@inithium/api-settings`): a `<link rel="preload" … crossorigin>` for each theme font's main file (the upright one covering 400), then a `<style id="inithium-theme-fonts">` holding `themeFontsCss()`. That's every library family's `@font-face` rules, a size-matched fallback face for each, and `--font-display` / `--font-body` pointed at the chosen families. Pages are sent with `Cache-Control: no-cache`. The head is cached until the library or the theme's fonts change (`markFontsChanged()` in `@inithium/api-fonts`). If it can't be built, the page goes out as built.
- **Fallback faces** are a system font (Arial, Times New Roman or Courier New, by the family's fallback type) with `size-adjust` and ascent, descent and line-gap overrides computed from the main file's metrics (`fallbackFaceCss()`), so text barely moves when the real font arrives. Families saved before files kept their metrics get them on the next start (`backfillFontFamilyMetrics()`).
- **The apps apply the same CSS again at runtime** with `ThemeFonts` (`@inithium/shared-ui-theme`), from the site bundle's `fontFamilies` and `settings.fonts`. That way a change saved in the CMS shows at once, and the Vite dev servers, which serve `index.html` themselves, still get the fonts (with a brief flash in development only).

The same step writes `data-dark-mode="on|off"` on each page's `<html>` from `darkMode`, so the page's colour scheme script knows before the first paint whether dark mode is allowed ([Dark mode](../ui-library/theme/dark-mode.md#no-light-flash)). It's rebuilt with the font head whenever settings are saved.

## Seeding

On every start, `seedSiteSettings()` creates the default settings (`siteTitle: 'Inithium'`) if none exist, and never changes existing ones. `getSiteSettings()` also creates them if they're somehow missing.

## The lib

`@inithium/api-settings` exports:

- **Model:** `SettingsModel` (one record, found by `key: 'site'`).
- **Mapping and service:** `toSiteSettings()`, `getSiteSettings()`, `updateSiteSettings()` and `DEFAULT_SITE_SETTINGS`.
- **Router:** `settingsRouter` (mounted at `/api/settings`).
- **Seeding:** `seedSiteSettings()`.
