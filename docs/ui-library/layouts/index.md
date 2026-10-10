---
title: Layouts
description: Page-level structures built from components and composites.
scope: core
tags: [ui, layouts]
order: 6
---

# Layouts

Layouts are page-level frames: what a `web` page sits in under the Navbar. They live in `@inithium/shared-ui-layouts` and may use components and composites. Pages pick one by key, and the web shell renders it ([0079](../../decisions/0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)).

| Layout | Key | Use it for |
| --- | --- | --- |
| [BareLayout](bare-layout.md) | `bare` | Focused pages such as sign-in: a centred card, no Footer |
| [DefaultLayout](default-layout.md) | `default` | Most pages: centred content with the Footer |

Still to come: `full-width`, `collection-list`, `collection-item` and `profile` (see [Pages and routing](../../architecture/pages-and-routing.md#layouts)).
