---
title: Pages
description: The pages collection, the endpoints the CMS and web use, the edit rules, and how seeds create and maintain pages.
scope: core
tags: [api, pages, cms, seeding]
order: 6
decisions: ["0078", "0079", "0080"]
---

# Pages

Every page on the `web` site is a record in the `pages` collection, managed through the CMS and drawn in `web` by a code template ([0078](../decisions/0078-store-pages-as-records-rendered-by-code-templates.md)). [Pages and routing](../architecture/pages-and-routing.md) explains the whole system; this page covers the API side, in `@inithium/api-pages`.

## The record

Contracts are in `@inithium/shared-contracts` (`pageSchema`, type `Page`):

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `title` | string, 1–100 | |
| `path` | string | `'/'` or kebab segments with `:name` parameters, e.g. `/events/:slug`. Unique. Never under `/api` or `/cms`. |
| `status` | `'published'` \| `'unpublished'` | Unpublished pages are left out of the site bundle. |
| `template` | kebab key | The code template that draws it, e.g. `home`. |
| `layout` | kebab key | One of `layouts`. |
| `layouts` | kebab keys | The layouts its template allows; the first is the default. |
| `bgColor`, `textColor` | colour value, optional | Default surface 50 and surface 950. |
| `animation` | `{ entrance?, exit? }`, optional | Default a fast fadeIn and fadeOut. |
| `audience` | `'all'` \| `'signed-out'` \| `'signed-in'` | Who may view it ([0079](../decisions/0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)). |
| `navigation` | `{ locations, label?, order, icon?, group? }` | Its menus ([0080](../decisions/0080-build-menus-from-page-navigation-settings.md)): `primary-nav`, `profile-nav`, `primary-footer`, `secondary-footer`. |
| `seo` | `{ title?, description? }` | Title up to 70 characters, description up to 160. |
| `protected` | boolean | Seeded pages: can't be deleted; path, template and layouts are fixed. |
| `createdAt`, `updatedAt` | ISO date-times | |

`publicPageSchema` (type `PublicPage`) is the same without `status`, `layouts`, `protected` and the dates: what `web` receives.

## Endpoints

| Endpoint | Who | Does |
| --- | --- | --- |
| `GET /api/site` | Anyone | The site bundle `web` loads at startup: `{ settings, pages }`, with every published page as a `PublicPage` (`siteBundleSchema`). |
| `GET /api/pages` | `pages.edit` | Every page, sorted by path. |
| `GET /api/pages/templates` | `pages.create` | The reusable templates new pages can be made from: `ReusableTemplate[]` (`key`, `label`, `description`, `layouts`). Today only `content`. |
| `POST /api/pages` | `pages.create` | Creates a page from a `pageCreateSchema` body: `title`, `path` (no parameters), `template` (a reusable one) and optional `layout` (default the template's first). `201` with the page. See [Creating pages](#creating-pages). |
| `POST /api/pages/:id/duplicate` | `pages.create` | Copies a page made from a reusable template, with a `pageDuplicateSchema` body (`title`, `path`). `201` with the copy. |
| `GET /api/pages/:id` | `pages.edit` | One page, or 404. |
| `PUT /api/pages/:id/content` | `pages.edit` | Saves a content page's draft from a `pageDraftSaveSchema` body (`{ draft }`). 400 with `issues` if it fails the content contracts; 409 for a page without blocks. |
| `POST /api/pages/:id/content/publish` | `pages.publish` | Copies the draft to `published` and sets the page's `status` to `published`. |
| `POST /api/pages/:id/content/discard` | `pages.edit` | Sets the draft back to the published version (or one empty section if it was never published). |
| `PATCH /api/pages/:id` | `pages.edit` | Edits a page with a `pageUpdateSchema` body (any of `title`, `status`, `layout`, `bgColor`, `textColor`, `animation`, `audience`, `navigation`, `seo`, `path`). `null` for `bgColor`, `textColor` or `animation` clears it, so the page falls back to its template's or the site's default. |
| `DELETE /api/pages/:id` | `pages.delete` | Deletes a page that isn't protected. |

### Creating pages

Pages are created from **reusable** templates ([0093](../decisions/0093-build-content-pages-from-sections-columns-and-blocks.md)). The api lists them in `reusableTemplates` (`reusable-templates.config.ts`), whose layouts must match the `web` templates with the same keys. Core has one, the [content page](../architecture/content-pages.md); plugins will add theirs through a slot.

A new page starts:
- **unpublished,** so it isn't on the site until someone with `pages.publish` publishes it;
- **out of every menu,** visible to everyone, unprotected, with no colours, animation or SEO;
- with **one empty section** in its draft content and nothing published, for content pages.

A duplicate copies the source's template, layout, colours, animation, audience, SEO and draft content. It starts unpublished, out of menus, unprotected and with nothing published. Pages drawn by their own code (Home, Login and so on) can't be duplicated.

| Create or duplicate rule | Response |
| --- | --- |
| The body fails its schema (a missing title, a path with parameters, a path under `/api` or `/cms`) | 400 with the Zod `issues` |
| `template` isn't a reusable template | `400 { message, field: 'template' }` |
| `layout` isn't one of the template's | `400 { message, field: 'layout' }` |
| `path` is already used | `409 { message, field: 'path' }` |
| Duplicating a page drawn by its own code | 409 |

`pathFromTitle(title)` from `@inithium/shared-contracts` suggests a path, e.g. `'Our Café & Team!'` → `'/our-cafe-team'`. A static path beats a parameterised one, so `/profile/settings` would win over `/profile/:id`.

Content pages carry `content`: `{ draft, published }` content documents ([0093](../decisions/0093-build-content-pages-from-sections-columns-and-blocks.md)). `/api/pages` returns both; the site bundle (`GET /api/site`) carries only `published`, as the public page's `content`. Stored content is read through `readContentDocument()`, which upgrades older versions. `content` also records `draftSavedAt` / `draftSavedBy` and `publishedAt` / `publishedBy` (ISO dates and user ids). The CMS editor saves and publishes through the endpoints above ([0094](../decisions/0094-edit-content-pages-in-a-full-screen-editor.md)).

### Edit rules

| Rule | Response |
| --- | --- |
| The body fails `pageUpdateSchema` (unknown fields such as `template`, a bad path, a bad colour) | 400 with the Zod `issues` |
| `layout` isn't in the page's `layouts` | 400 |
| `navigation.locations` isn't empty on a path with parameters, unless it's the `profile` template in `profile-nav` only | 400 |
| `status` changes without `pages.publish` | 403 |
| `path` changes on a protected page | 409 |
| `path` is already used by another page | 409 |
| Deleting a protected page | 409: unpublish it instead |

`navigationAllowed(page)` and `pathHasParams(path)` from `@inithium/shared-contracts` implement the menu rule, so the CMS can check it before saving.

## Seeding

On every start, after the dev account and [site settings](site-settings.md), the api runs `seedCorePages()`. It creates core's single-use pages if they don't exist yet:

| Template | Path | Title | Layouts | Audience | Menus |
| --- | --- | --- | --- | --- | --- |
| `home` | `/` | Home | `default` | all | `primary-nav`, `primary-footer` |
| `profile` | `/profile/:id` | Profile | `default` | all | `profile-nav` |
| `login` | `/login` | Login | `bare` | signed-out | none |
| `sign-up` | `/sign-up` | Sign up | `bare` | signed-out | none |
| `not-found` | `/404` | Page not found | `default` | all | none |

New pages are published and protected. On later starts the seed **never touches what the CMS edits** (titles, status, appearance, audience, menus, SEO). It only brings the fields the code owns, `path` and `layouts`, back in line with the seed. If the chosen layout is no longer allowed, it resets to the first. That way, a template that gains a layout (Profile will move to `profile`) updates existing sites on their next start. The Not Found page also serves unknown paths and unpublished pages in `web`.

`seedPages(seeds)` takes any list of `PageSeed`s, so plugins can seed their own pages the same way. How their unseed tracks what it created is still open ([0019](../decisions/0019-seed-tracking.md)).

## The lib

`@inithium/api-pages` exports:

- **Model:** `PageModel` (the `pages` collection).
- **Mapping:** `toPage()` and `toPublicPage()`.
- **Service functions:** `listPages()`, `listPublishedPages()`, `findPageById()`, `createPage()`, `duplicatePage()`, `updatePage()`, `deletePage()`, `saveContentDraft()`, `publishContent()` and `discardContentDraft()`.
- **Reusable templates:** `reusableTemplates` and `listReusableTemplates()`.
- **Routers:** `pagesRouter` (mounted at `/api/pages`) and `siteRouter` (mounted at `/api/site`).
- **Seeding:** `seedPages()`, `seedCorePages()` and `corePageSeeds`.
