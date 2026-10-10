---
title: Site settings
description: The single settings record that holds the site's title, logo and copyright holder, and its endpoints.
scope: core
tags: [api, settings, cms, branding]
order: 7
decisions: ["0082"]
---

# Site settings

Site-wide settings live in one record in the `settings` collection, in `@inithium/api-settings` ([0082](../decisions/0082-keep-site-wide-settings-in-one-record.md)). They give the Navbar its title and logo and the Footer its copyright holder, and the CMS edits them on its Settings screen.

## The record

Contracts are in `@inithium/shared-contracts` (`siteSettingsSchema`, type `SiteSettings`):

| Field | Type | Notes |
| --- | --- | --- |
| `siteTitle` | string, 1–100 | The Navbar title and the end of every document title. Default `My site`. |
| `logo` | `{ src, alt }`, optional | A URL until assets exist. |
| `copyright` | string, 1–100, optional | The Footer's copyright holder. |
| `updatedAt` | ISO date-time | |

Theme colours, fonts, SEO defaults and an uploaded logo come later.

## Endpoints

| Endpoint | Who | Does |
| --- | --- | --- |
| `GET /api/site` | Anyone | Returns the settings with the published pages; see [Pages](pages.md#endpoints). |
| `GET /api/settings` | `settings.edit` | The settings. |
| `PUT /api/settings` | `settings.edit` | Replaces them with a `siteSettingsInputSchema` body; fields left out (`logo`, `copyright`) are cleared. 400 with Zod `issues` if invalid. |

## Seeding

On every start, `seedSiteSettings()` creates the default settings (`siteTitle: 'My site'`) if none exist, and never changes existing ones. `getSiteSettings()` also creates them if they're somehow missing.

## The lib

`@inithium/api-settings` exports:

- **Model:** `SettingsModel` (one record, found by `key: 'site'`).
- **Mapping and service:** `toSiteSettings()`, `getSiteSettings()`, `updateSiteSettings()` and `DEFAULT_SITE_SETTINGS`.
- **Router:** `settingsRouter` (mounted at `/api/settings`).
- **Seeding:** `seedSiteSettings()`.
