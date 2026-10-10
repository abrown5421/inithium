---
id: "0078"
title: Store pages as database records that code templates render
status: accepted
date: "2026-10-10"
scope: core
tags: [pages, routing, cms, plugins, contracts]
related: ["0002", "0015", "0019", "0079", "0080", "0081", "0082"]
supersedes: []
---

# 0078. Store pages as database records that code templates render

## Context

`web` must show pages that aren't known when it's built, and clients must manage them in the CMS. Inithium's real value is complex, logic-heavy pages (catalogues, carts, checkouts, profiles) that core and plugins ship as code; a no-code page builder is not the main offering. Pages can't live only in TSX files, though: the CMS would have to write to the file system, and a Render deploy would need rebuilding for every new page. Some pages (home, profile, sign-in) are integral and must never be deleted.

The desired end state lets clients build simple marketing pages from blocks (Containers, Text, Buttons, Images) in the CMS, while all complex page logic stays in core and plugin code. That end state is not built now.

## Decision

- **Every page is a record** in a `pages` collection, with Zod contracts in `@inithium/shared-contracts` so core, plugins and the CMS share them:
  - **General:** `title`, `path` (unique; may hold parameters such as `/events/:slug`), `status` (`published` or `unpublished`), `template` (a key), `layout` (one the template allows);
  - **Appearance:** `bgColor`, `textColor` (colour values; default surface 50 and surface 950) and `animation` `{ entrance, exit }` (default a fast fadeIn and a fast fadeOut);
  - **Access:** `audience` ([0079](0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md));
  - **Navigation:** menu placement ([0080](0080-build-menus-from-page-navigation-settings.md));
  - **SEO:** `seo` `{ title?, description? }`;
  - **System:** `protected` (can't be deleted; path and template fixed).
- **Code renders pages through templates.** A template is registered in `web` under a key and declares its component, whether it's **single-use** (one page, e.g. Home) or **reusable** (many pages, e.g. a content page), and which layouts it allows (the first is the default). Core registers its own templates; plugins and client libs register theirs through the web registry (the first slot of [0015](0015-slot-catalogue.md)).
- **Records come from seeds.** Core seeds its single-use pages; plugins seed theirs on install and remove them on unseed. Seeded records are `protected`. The CMS can change everything on a protected page except its path, template and protection, and can unpublish but not delete it.
- **Creating pages in the CMS** offers only reusable templates; until one exists, the CMS edits pages but can't create them. The future block editor arrives as a reusable "content page" template that renders blocks stored on the record, possibly from a plugin.
- **Clients customise core pages** by registering their own component under a core template key (e.g. `home`) from `libs/client/`, without editing core.
- **Core's pages:** Home (`/`), Profile (`/profile/:id`), Login (`/login`), Sign up (`/sign-up`) and Not Found, all single-use, protected and published by default.
- **Permissions:** `pages.edit` (owner, admin, editor), `pages.publish` and `pages.delete` (owner, admin), and `settings.edit` (owner, admin).

## Alternatives considered

- **Pages only in code:** the CMS couldn't create or manage pages without writing files and redeploying.
- **A block-based page builder as the foundation:** complex pages can't realistically be built from blocks; blocks come later, as one template.
- **Pages without a database (titles and menus from code):** rejected for the same reason as pages only in code.

## Consequences

- A template key on a record must match a registered template; an ejected plugin's unseed removes its records first.
- The page contract is shared, so plugins can seed pages and the CMS can validate edits with the same schemas.
- The web registry, and the page-related parts of the slot catalogue, are defined with this work.
