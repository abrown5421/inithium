---
id: "0080"
title: Build menus from each page's navigation settings
status: accepted
date: "2026-10-10"
scope: core
tags: [pages, navigation, cms]
related: ["0076", "0077", "0078", "0079"]
supersedes: []
---

# 0080. Build menus from each page's navigation settings

## Context

The Navbar and Footer need their links, and clients must be able to place pages in menus from the CMS. Earlier client sites managed this on each page's record, under a Navigation tab.

## Decision

- **Each page record carries its navigation settings:** the menu locations it appears in, a label (default: its title), an order number, an optional icon, and an optional group name.
- **Four locations:** `primary-nav` (Navbar links), `profile-nav` (the Navbar drawer's user links), `primary-footer` and `secondary-footer` (the Footer's two rows). Plugins can't add locations.
- **Groups:** pages in `primary-nav` sharing a group name form one dropdown, placed where its lowest-ordered page would be, with its pages sorted by their own order. Groups have no icon. In the Footer, groups are flattened.
- **Parameters:** pages whose path has parameters can't be placed in menus, except the Profile page in `profile-nav`, whose `:id` is filled with the signed-in user's id. Pages such as `/blog/:id` are reached from links on other pages.
- **Only published pages** the current visitor's audience allows appear in menus.

## Alternatives considered

- **A separate menu record:** keeping placement on each page matches how clients already manage it, and a page's links follow it automatically.
- **Links to external sites in menus:** not part of this decision; menus hold pages only.

## Consequences

- Menu contents are computed in `web` from the page records it already loads.
- The CMS page editor needs a Navigation tab for these settings.
