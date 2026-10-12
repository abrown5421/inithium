---
id: "0090"
title: Save a generated avatar and banner with every account, and show profiles by viewer
status: accepted
date: "2026-10-12"
scope: core
tags: [profiles, users, pages, slots]
related: ["0015", "0024", "0026", "0074", "0075", "0078", "0081", "0083", "0088"]
supersedes: []
---

# 0090. Save a generated avatar and banner with every account, and show profiles by viewer

## Context

[0081](0081-extend-the-profile-page-through-slots-by-viewer.md) settled the profile page's shape: a banner, an overlapping avatar, an identity sidebar, tabs, three slots and three kinds of viewer. Building it needed the profile's data, its API, what accounts without a saved avatar or banner show, and the slots' contract shapes. Image uploads wait for assets ([0028](0028-store-assets-behind-pluggable-storage-drivers.md)).

## Decision

- **Every account has a saved avatar and banner from the moment it's created.** There should never be nothing saved. Sign-up (and the seeded dev account) stores:
  - an **avatar** recipe in the `initials` style on the `primary` background, seeded by the account's id;
  - a **banner** recipe with the theme's brand colours (`primary`, `secondary`, `tertiary`, `quaternary`, `accent`) in random order, intensities (200–800) and counts (2–4) along both the x and y gradients, a random cell size (40–150px), variance (0.3–1) and seed.
  - Colours are stored as theme references, so a re-brand recolours every banner. Accounts created before this get theirs on the next api start.
- **Profile data** sits in the user's `profile` subdocument: optional `firstName`, `lastName` and `bio` (up to 280 characters), plus the required `avatar` and `banner` recipes. Plugins still never add to it ([0026](0026-plugins-keep-user-data-in-their-own-collections.md)).
- **API:** `GET /api/profiles/:id` is public and returns the names, bio, recipes and join date, plus the email only for the profile's owner; unknown ids are a 404. `PATCH /api/profiles/me` edits the signed-in user's own profile (fields left out stay; an empty last name or bio removes it).
- **Names:** a profile without names shows as "Member" to others, never the email; its owner sees a prompt to add one.
- **Viewers:** visitors and members see the same in core; owners also see their email, edit the avatar and banner in place (saved straight away), and have an Account tab (names, bio, read-only email, password change). Core's tabs are About (everyone) and Account (owner only); the tab bar hides when only one tab is visible; an unknown profile shows the Not Found page in place. Staff accounts have profiles like anyone else, with no role shown.
- **Layout:** pages choose a new `full-width` layout (no width limit or padding); the profile's frame is the `ProfileLayout` organism inside it. Banner 220px (140px on phones), avatar 128px (96px) overlapping it by half, columns stacked below 768px.
- **Slot contracts:** profile tabs, sidebar sections and header actions are entries `{ key, order, viewers, component }` (tabs and sidebar sections add a `label`, tabs an optional `icon`), whose component gets `{ profile, viewer }`. They're registered through the web registry (`registeredProfileSlots`, shipped empty); core's own entries are added in code at orders 0 and 1000.
- **Navbars** in `web` and the CMS show the signed-in user's own avatar.
- Profile ids stay MongoDB ids for now.

## Alternatives considered

- **Draw a default avatar and banner from the account's id until the owner saves one, storing nothing:** rejected; every account should have its own saved banner and avatar from the start.

## Consequences

- `userSchema.profile` is now required, and every `User` carries the avatar and banner recipes, so `/auth/me` gives the Navbar the user's avatar.
- `createUser()` always generates the recipes; any other path that creates users must go through it.
- Settles the contract shapes of the profile slots in the slot catalogue ([0015](0015-slot-catalogue.md)).
- A multi-line text field doesn't exist yet, so the bio is a single-line Input.
