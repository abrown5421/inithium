---
id: "0081"
title: Extend the profile page through slots that know who is viewing
status: accepted
date: "2026-10-10"
scope: core
tags: [pages, profiles, plugins, slots]
related: ["0015", "0026", "0074", "0075", "0078"]
supersedes: []
---

# 0081. Extend the profile page through slots that know who is viewing

## Context

The Profile page (`/profile/:id`) must scale with plugins (friends, blog comments, orders, addresses) in ways that can't all be predicted, and it must vary with the viewer: a signed-out visitor, another member, or the profile's owner.

## Decision

- **Layout:** the `profile` layout puts a full-width PolyBanner ([0074](0074-generate-banners-as-our-own-poly-pattern.md)) under the Navbar, the Avatar ([0075](0075-draw-avatars-with-dicebear-from-a-stored-recipe.md)) overlapping it, and two columns: an identity sidebar on the left and tabbed content on the right.
- **Viewer context:** every part of the page knows whether the viewer is a `visitor` (signed out), a `member` (signed in, someone else's profile) or the `owner`.
- **Three slots** let core and plugins contribute, each contribution declaring which viewers see it and rendering differently for each if it needs to:
  - **tabs** in the right column (e.g. Account Settings, Friends, Orders);
  - **sidebar sections** in the left column (e.g. an address);
  - **header actions** near the avatar (e.g. "Add friend").
- **Visitors see** the name, avatar, banner and join date. The email, and editing the avatar, banner and account, are for the owner only. Privacy settings come later.
- **Tabs are in the URL** (`/profile/:id?tab=orders`), so links and `profile-nav` entries can open a specific tab.
- **Plugin data** comes from each plugin's own endpoints, never from the user record ([0026](0026-plugins-keep-user-data-in-their-own-collections.md)).

## Alternatives considered

- **A fixed profile page that plugins can't extend:** it couldn't grow with plugins.

## Consequences

- These three slots join the slot catalogue ([0015](0015-slot-catalogue.md)); their contract shapes are defined when the profile page is built, after end-user auth and profiles exist.
