---
title: Site settings
description: The single settings record that holds the site's title, logo, favicon and copyright holder, and its endpoints.
scope: core
tags: [api, settings, cms, branding]
order: 7
decisions: ["0082", "0087", "0098", "0101"]
---

# Site settings

Site-wide settings live in one record in the `settings` collection, in `@inithium/api-settings` ([0082](../decisions/0082-keep-site-wide-settings-in-one-record.md)). They give the Navbar its title and logo and the Footer its copyright holder, and the CMS edits them on its Settings screen.

## The record

Contracts are in `@inithium/shared-contracts` (`siteSettingsSchema`, type `SiteSettings`):

| Field | Type | Notes |
| --- | --- | --- |
| `siteTitle` | string, 1–100 | The Navbar title and the end of every document title. Default `Inithium`. |
| `logo` | `{ assetId, alt }`, optional | An uploaded image, by its [asset](assets.md) id, and its description ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)). `logoImage(logo)` gives the Navbar's `{ src, alt }`. Without one, `web` and the CMS show Inithium's default logo (`defaultLogo` from `@inithium/shared-ui-theme`). Its asset can't be deleted while it's the logo. |
| `favicon` | `{ assetId }`, optional | The browser-tab icon of `web` and the CMS: an uploaded ICO, PNG or SVG ([0101](../decisions/0101-set-the-favicon-from-an-uploaded-asset.md)). Without one, both show Inithium's default `favicon.ico` (the Inithium logo, bundled in each app). Its asset can't be deleted while it's the favicon. |
| `copyright` | string, 1–100, optional | The Footer's copyright holder. |
| `theme` | `{ colors: { primary, secondary, tertiary, quaternary, accent, surface } }`, optional | The theme as hex codes (`themeConfigSchema`): the brand tokens' 500s and surface's 100 ([0087](../decisions/0087-set-theme-colours-in-cms-settings.md)). Missing means core's default theme. |
| `updatedAt` | ISO date-time | |

The theme's fonts come later (the `display` and `body` families, [0111](../decisions/0111-keep-uploaded-font-families-in-a-library.md)), and so do SEO defaults. Logos saved as URLs before assets existed are dropped, so those sites show the default logo until one is chosen.

## Endpoints

| Endpoint | Who | Does |
| --- | --- | --- |
| `GET /api/site` | Anyone | Returns the settings with the published pages; see [Pages](pages.md#endpoints). |
| `GET /api/settings` | `settings.edit` | The settings. |
| `PUT /api/settings` | `settings.edit` | Replaces them with a `siteSettingsInputSchema` body; fields left out (`logo`, `favicon`, `copyright`, `theme`) are cleared, so leaving out `theme` returns the site to core's default colours. 400 with Zod `issues` if invalid. |

## Seeding

On every start, `seedSiteSettings()` creates the default settings (`siteTitle: 'Inithium'`) if none exist, and never changes existing ones. `getSiteSettings()` also creates them if they're somehow missing.

## The lib

`@inithium/api-settings` exports:

- **Model:** `SettingsModel` (one record, found by `key: 'site'`).
- **Mapping and service:** `toSiteSettings()`, `getSiteSettings()`, `updateSiteSettings()` and `DEFAULT_SITE_SETTINGS`.
- **Router:** `settingsRouter` (mounted at `/api/settings`).
- **Seeding:** `seedSiteSettings()`.
