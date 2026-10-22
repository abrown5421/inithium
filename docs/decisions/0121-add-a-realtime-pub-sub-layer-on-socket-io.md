---
id: "0121"
title: Add a realtime pub/sub layer on Socket.IO
status: accepted
date: "2026-10-22"
scope: core
tags: [realtime, api, frontend, plugins, slots]
related: ["0006", "0007", "0015", "0088", "0100", "0103", "0104", "0105", "0107", "0122"]
supersedes: []
---

# 0121. Add a realtime pub/sub layer on Socket.IO

## Context

Every Inithium app will need to push things to people as they happen, on behalf of core, plugins and client code. Uses already in view:

- **Core:** a presence light on avatars (active, idle, signed out).
- **Plugins:** a blog telling a post's author about a new comment; a contact plugin with a CMS inbox, so clients talk to enquirers without a mail server; a friends plugin with requests and changes.
- **Client code:** a Jackbox-style game, with a host screen and phones as controllers, all moving through the game's states together.

Until now the api only answered requests. Each client runs as one Render web service on one origin ([0006](0006-serve-each-client-from-one-origin.md), [0104](0104-separate-development-showcase-staging-and-production-environments.md)). Every client must pay for Render's lowest paid instance, so the api never sleeps and long-lived connections are safe. Clients shouldn't pay for anything more than that if it can be avoided.

## Decision

**Core ships one realtime layer: Socket.IO on the api's own server, at `/api/realtime`, wrapped so nothing outside it uses Socket.IO directly.**

- **Transport:** Socket.IO 4 (server `socket.io`, client `socket.io-client`), on the same origin and cookies as the API. Vite's dev proxies forward WebSockets.
- **Channels:** clients subscribe to named channels, `<namespace>:<kind>` then parameters after slashes (e.g. `core:pages`, `plugin-blog:post/<id>`). Namespaces are `core`, `plugin-<name>` and `client-<name>`.
- **Contracts are shared, behaviour is the api's:** `defineRealtimeChannel()` in `@inithium/shared-contracts` declares a channel's name, its events (each a Zod schema), the messages clients may send (payload and result schemas) and its presence metadata. The api serves it with `serveRealtimeChannel()` from `@inithium/api-realtime`: who may subscribe (`guests`, `permission`, `canSubscribe()`), what each message does, and optionally the presence metadata.
- **The server decides:** only api code publishes (`publishRealtime()`, checked against the channel's schema). Clients never broadcast. They send the messages a channel declares; its handler validates them, acts, and publishes what others should see. A connection must be subscribed to a channel to send on it.
- **Ephemeral and at-most-once.** There's no history or replay. Anything that must survive someone being offline (a comment notification, an inquiry, a friend request) is stored by its feature first, then announced. Clients treat events as "this changed", patch or refetch their cached data, and refetch after resubscribing, since events may have been missed.
- **Identity:** the handshake reads the access cookie once. A signed-in user or a guest; sessions that must change their password count as guests ([0088](0088-make-temporary-passwords-change-on-first-sign-in.md)). Guests may subscribe only to channels that allow them. A connection ends when its access token expires or its sessions are revoked ([0100](0100-manage-accounts-from-the-cms.md)): the api sends `reauth`, the client refreshes the session and reconnects, and every subscription is checked again. Handshakes from another site's pages are refused.
- **Presence** is a primitive of the layer: a channel can track who's subscribed, with each subscriber's metadata and whether they're active or idle. A user's tabs and devices merge into one member. The client reports idle after 5 minutes without input, or when the tab is hidden.
- **Limits per connection:** 32 KB messages, 20 messages a second on average, 100 subscriptions, and 10 connections per account (the oldest makes way).
- **One instance today, more later without new costs:** published events go through a `RealtimeBroker`. Core ships the in-memory broker. When a client first runs more than one instance, a **MongoDB change-streams** broker will implement it, never Redis, which would be a paid service on top.
- **Plugins and client libs** add channels through a new slot ([0015](0015-slot-catalogue.md)): `registeredRealtimeChannels` in the api's registry. Core passes its own to `startRealtime()`.
- **Frontends** share one connection per app from `@inithium/shared-realtime`: `RealtimeProvider` at the root (it opens on the first subscription), `useChannel()`, `usePresence()` and `useRealtimeStatus()`.
- **Tests** use `listenTestApi()` and `connectTestRealtime()` from `@inithium/api-testing`.

## Alternatives considered

- **Plain WebSockets (`ws`) with our own protocol:** lighter, but rooms, acknowledgements, reconnection with backoff and heartbeats would all be rebuilt.
- **Server-sent events:** server to client only, which rules out a game's controllers sending input.
- **Clients publishing directly to channels:** rejected. The api stays the single source of truth, and every message passes a handler that checks it.
- **Redis for scaling out:** rejected because it would add a paid service for clients. MongoDB change streams use the cluster each client already has.
- **Building the MongoDB broker now:** deferred. Every client runs one instance, and the broker would write every event to the database (counting toward the free cluster's storage) for no gain yet.
- **History or replay inside the layer:** rejected. Each feature stores what must last.

## Consequences

- `@inithium/api-realtime` (server, broker, channel slot) and `@inithium/shared-realtime` (browser connection and hooks) are new libs. `api-auth` gains `readAuthFromCookieHeader()` and `onSessionsRevoked()`, so `api-realtime` sits above it without a cycle.
- The api starts the realtime server on its HTTP server. Shutting down closes realtime first, then the HTTP server.
- Both apps render `RealtimeProvider`. Nothing connects until something subscribes, so pages that don't use realtime cost nothing.
- Features that need persistence must still build it, e.g. a notifications centre (a bell with unread counts), which is expected as its own core feature on top of this layer.
- What an inactive plugin's channels do (refuse subscriptions, most likely) is part of [0107](0107-plugin-lifecycle-mechanics.md).
- With more than one instance and no shared broker, events and presence would only reach connections on the same instance. Scaling out must come with the MongoDB broker, which must also share presence.
