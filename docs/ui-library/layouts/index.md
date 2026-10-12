---
title: Layouts
description: Page-level structures built from components and composites.
scope: core
tags: [ui, layouts]
order: 6
---

# Layouts

Layouts are page-level frames: what a `web` page sits in under the Navbar, or an app frame such as the CMS's. They live in `@inithium/shared-ui-layouts` and may use components and composites. Pages pick one by key, and the web shell renders it ([0079](../../decisions/0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)).

| Layout | Key | Use it for |
| --- | --- | --- |
| [BareLayout](bare-layout.md) | `bare` | Focused pages such as sign-in: a centred card, no Footer |
| [DefaultLayout](default-layout.md) | `default` | Most pages: full-width padded content with the Footer |
| [FullWidthLayout](full-width-layout.md) | `full-width` | Pages that draw their own frame edge to edge, e.g. Profile |
| [ProfileLayout](profile-layout.md) | (inside `full-width`) | A profile: banner, overlapping avatar, identity sidebar and main column |
| [SidebarLayout](sidebar-layout.md) | (app frame) | The CMS: a top bar and a collapsible sidebar of sections |

Still to come: `collection-list` and `collection-item` (see [Pages and routing](../../architecture/pages-and-routing.md#layouts)).
