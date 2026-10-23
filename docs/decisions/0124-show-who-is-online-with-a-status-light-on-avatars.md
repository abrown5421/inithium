---
id: "0124"
title: Show who's online with a status light on avatars
status: accepted
date: "2026-10-22"
scope: core
tags: [presence, realtime, avatar, profiles, cms, plugins, slots]
related: ["0015", "0075", "0076", "0090", "0100", "0105", "0121"]
supersedes: []
---

# 0124. Show who's online with a status light on avatars

## Context

With the realtime layer built ([0121](0121-add-a-realtime-pub-sub-layer-on-socket-io.md)), core can show whether people are on the site. Each user's avatar should carry a coloured light for their status, named in a tooltip. Plugins and client code will want statuses of their own, for example "In a class" for a live class plugin, or "Playing Trivia Night" on a gaming platform built on Inithium. So the statuses come from a registry, not a fixed list. [0076](0076-navigate-with-a-navbar-that-collapses-into-a-drawer.md) had left an online dot out until realtime existed.

## Decision

**Every avatar can carry a status light; core defines three statuses, and plugins add more through a registry.**

- **Core's statuses:**
  - **Active** (green 500): signed in, with input in the last 10 minutes on any tab or device.
  - **Inactive** (yellow 500): signed in and connected, but with no input for 10 minutes or more.
  - **Away** (surface 500): not on the site, either signed out or with every tab closed.
- **Activity:** a browser reports idle after 10 minutes without input (`REALTIME_IDLE_AFTER_MS`, up from 5). The timer runs from the moment a page connects, so a hidden tab (even one opened in the background) goes idle on the same timer instead of at once, since switching tabs isn't leaving. Pointer moves and wheel turns count only while the window has focus, and a reconnecting browser sends its activity in the handshake. A signed-in user's browser keeps its realtime connection open even when nothing subscribes, so they count as present. Their tabs and devices are combined: active if any is.
- **The registry:** `definePresenceStatus({ key, label, color, priority })` in `@inithium/shared-contracts`. Extra statuses are keyed `plugin-<name>:<status>` or `client-<name>:<status>`. `label` may be a function of a short detail (e.g. the game's name). The same list goes in all three apps' registries as `registeredPresenceStatuses`: the api checks keys, and `web` and the CMS draw the colours ([0015](0015-slot-catalogue.md)).
- **Plugin statuses** are set and cleared by api code with `setUserStatus(userId, key, { detail? })` and `clearUserStatus()` from `@inithium/api-presence`. They show only while the user is online, replace Active and Inactive, and are cleared when the user's last connection closes. When several are set, the highest `priority` wins.
- **Delivery:** the realtime channel `core:user-status/<userId>` sends a new subscriber the status at once, then each change. **Anyone may follow anyone's status**, guests included, whatever either's role: statuses aren't gated by role at all, dev accounts included. Statuses live in the api's memory only: no "last seen", no history.
- **Drawing:** Avatar's `presence={{ color, label }}` draws the light on the bottom-right edge ([0075](0075-draw-avatars-with-dicebear-from-a-stored-recipe.md)). The edit button moves to the top-right edge when there's a light. `useUserPresence(userId)` from `@inithium/shared-realtime` gives that shape.
- **Where it shows: everywhere an avatar of a user is drawn:** the Navbar's own avatar (in `web` and the CMS's top bar), the Profile page, the CMS Users list and the user details dialog. New places that draw a user's avatar pass `useUserPresence(userId)` too.
- **No manual statuses** (do not disturb, appear offline) for now.

## Alternatives considered

- **A fixed list of statuses:** rejected, since plugins and client code need their own.
- **Counting a hidden tab as idle at once:** rejected; switching tabs isn't leaving the site.
- **Leaving the light off the Navbar's own avatar** (it's mostly green to yourself): rejected, so every avatar carries one.
- **Hiding dev accounts' statuses from non-dev viewers,** as the CMS hides dev accounts: rejected. There's no reason to gate statuses by role.
- **Hiding statuses from guests, or a privacy setting:** not now. A "hide my status" option may come with the profile privacy settings still to be built.
- **Moving or hiding the edit button some other way:** the light takes the bottom-right edge because that's where status lights conventionally sit; the button moves to the matching spot at the top.

## Consequences

- A new lib, `@inithium/api-presence`, works out statuses and serves the channel. `api-realtime` gains `onUserActivity()` / `userActivity()` and channels' `snapshot()`, and `shared-realtime` gains `setKeepOpen()` and `useUserPresence()`.
- Every signed-in browser now holds a realtime connection while it's open.
- A plugin's status whose plugin is ejected or inactive draws as Active. What inactive plugins' statuses do in detail is part of [0107](0107-plugin-lifecycle-mechanics.md).
- With more than one api instance, activity is counted per instance until the MongoDB broker ([0121](0121-add-a-realtime-pub-sub-layer-on-socket-io.md)) also shares it.
