---
title: Realtime
description: The realtime pub/sub layer - channels, publishing, messages, presence, sessions and limits on the api, the browser hooks, and how plugins add channels.
scope: core
tags: [api, realtime, plugins, frontend]
order: 13
decisions: ["0121", "0122", "0015", "0124"]
---

# Realtime

The api pushes events to browsers as they happen through one realtime layer ([0121](../decisions/0121-add-a-realtime-pub-sub-layer-on-socket-io.md)): Socket.IO on the api's own server at `/api/realtime`, on the same origin and cookies as the API. Core, plugins and client libs all use it the same way, through **channels**.

- `@inithium/shared-contracts` holds the wire protocol and `defineRealtimeChannel()`: a channel's contract, shared by both sides.
- `@inithium/api-realtime` holds the server: `startRealtime()`, `publishRealtime()`, `serveRealtimeChannel()` and the broker.
- `@inithium/shared-realtime` holds the browser side: `RealtimeProvider`, `useChannel()`, `usePresence()` and `useRealtimeStatus()`.

Nothing outside these libs uses Socket.IO directly.

## How it works

- **The server decides.** Only api code publishes events. Clients subscribe, receive, and send the *messages* a channel declares; each message goes to the channel's handler on the api, which checks it, acts and publishes what others should see.
- **Ephemeral.** An event reaches whoever is subscribed at that moment, at most once. There's no history. Anything that must reach someone who's offline (a notification, an inquiry, a request) is **stored by its feature first**, then announced; the client treats the event as "this changed" and patches or refetches its data.
- **Missed events.** When the connection drops and comes back, the client subscribes again and calls each subscriber's `onResubscribed`. Refetch there.

## Defining a channel

A channel's contract lives in a `scope:shared` lib, so the api and the frontends share it: core's in `shared-contracts`, a plugin's in its `contracts` layer.

```ts
import { z } from 'zod';
import { defineRealtimeChannel } from '@inithium/shared-contracts';

export const gameRoomChannel = defineRealtimeChannel({
  namespace: 'client-games', // core, plugin-<name> or client-<name>
  kind: 'room',
  params: ['code'], // [] for none
  events: { 'round.started': z.object({ round: z.number() }) },
  messages: {
    'answer.submit': { payload: z.object({ answer: z.string().max(80) }), result: z.object({ accepted: z.boolean() }) },
  },
  presence: { meta: z.object({ nickname: z.string().max(20) }) },
});

gameRoomChannel.name({ code: 'ABCD' }); // 'client-games:room/ABCD'
gameRoomChannel.match('client-games:room/ABCD'); // { code: 'ABCD' }
```

Names are `<namespace>:<kind>` then parameters after slashes. Parameters may hold letters, digits, `_` and `-`, up to 64 characters each; `name()` throws on anything else. Event and message types are dotted kebab-case, e.g. `comment.created`.

| Field | Meaning |
| --- | --- |
| `namespace` | `core`, `plugin-<name>` or `client-<name>` |
| `kind` | What it's about, e.g. `pages`, `post` |
| `params` | Parameter names, in order |
| `events` | What the api publishes: type → Zod schema |
| `messages` | What subscribers may send: type → `{ payload, result? }` schemas. Leave out for a listen-only channel. |
| `presence` | Track who's subscribed; `meta` is the schema for each subscriber's metadata (leave out for none) |

## Serving a channel

The api's side says who may subscribe and handles the messages:

```ts
import { RealtimeError, serveRealtimeChannel } from '@inithium/api-realtime';

export const gameRoomServer = serveRealtimeChannel(gameRoomChannel, {
  guests: true, // default false: signed-in users only
  canSubscribe: async (_context, { code }) => Boolean(await GameModel.exists({ code, open: true })),
  messages: {
    'answer.submit': async ({ answer }, context, { code }) => {
      if (!(await isPlayersTurn(code, context))) throw new RealtimeError('FORBIDDEN', 'Not your turn');
      await saveAnswer(code, context.connectionId, answer);
      return { accepted: true };
    },
  },
});
```

| Option | Meaning |
| --- | --- |
| `guests` | Whether connections without a session may subscribe. Default false. |
| `permission` | A permission the subscriber's role must hold (implies signed in). |
| `canSubscribe(context, params)` | Any further check, after `guests` and `permission`. |
| `snapshot(context, params)` | Events sent only to a new subscriber, straight after subscribing: the state now, e.g. a user's current status ([Presence](presence.md)). Returns `{ type, payload }[]`, each checked against the channel's schema. |
| `presenceMeta(context, params, requested)` | Sets the subscriber's presence metadata on the api, replacing what the client sent (e.g. a name looked up from the account). Without it the client's `meta` is used, checked by the schema. |
| `messages` | A handler per declared message: `(payload, context, params)`, returning the result. Required when the channel declares messages. |

`context` is `{ connectionId, user?: { id, role } }`. Payloads are checked against the contract before a handler runs, and results after. Throw a `RealtimeError(code, message)` to refuse with a reason the client sees; anything else thrown is logged and answered `FAILED` with no detail.

Core passes its channels to `startRealtime()` in `apps/api/src/main.ts`. **Plugins and `libs/client/` add theirs to `registeredRealtimeChannels`** in `apps/api/src/app/plugins.registry.ts` (the install tool's job, [0015](../decisions/0015-slot-catalogue.md)). Two channels may not share a `<namespace>:<kind>`; `checkRealtimeChannels()` throws naming the clash, and the registry's spec checks it.

## Publishing

```ts
import { publishRealtime } from '@inithium/api-realtime';

publishRealtime(gameRoomChannel, { code: 'ABCD' }, 'round.started', { round: 2 });
```

The payload is checked against the channel's schema, and a mismatch throws. Publish after the change is stored, never instead of storing it.

## Presence

A channel with `presence` tracks its subscribers. Each member is `{ key, userId?, guest, activity, meta? }`:

- A signed-in user's tabs and devices are **one member** (`key` is their user id), `active` if any of them is, with the most recent connection's `meta`.
- Each guest connection is its own member (`key` is `guest:<connection id>`).
- `activity` is `active` or `idle`. The browser reports idle after `REALTIME_IDLE_AFTER_MS` (10 minutes) without input, and active again on input; a hidden tab gets no input, so it goes idle on the same timer ([0124](../decisions/0124-show-who-is-online-with-a-status-light-on-avatars.md)).

A subscriber first gets the whole list (`sync`), then `join`, `update` and `leave` changes. `usePresence()` keeps the list for you.

### Users' activity

Apart from channels, the server keeps each signed-in user's activity across all their connections: `userActivity(userId)` is `active` (any connection active), `idle` (all idle) or `offline` (none), and `onUserActivity(listener)` is told each change. Users' [presence statuses](presence.md) are built on it.

## Sessions

- **Identity is read once**, from the access cookie at the handshake (`readAuthFromCookieHeader()` from `api-auth`). No valid session means a guest. A session that must change its password first counts as a guest too ([0088](../decisions/0088-make-temporary-passwords-change-on-first-sign-in.md)).
- **When the session ends, the connection ends.** When the access token expires, or `revokeSessions()` signs the account out (a role change, password reset or deletion, [0100](../decisions/0100-manage-accounts-from-the-cms.md)), the api sends `reauth` and closes the connection. The browser refreshes the session (`refreshSession()` from `shared-data-access`) and reconnects, signed in or as a guest, and every subscription is checked again. So a role change applies to subscriptions at once.
- **Same origin only.** A handshake whose `Origin` isn't the api's own host is refused, since the connection carries the session cookie.

## Limits

`REALTIME_LIMITS` in `shared-contracts`. Channels can't raise them.

| Limit | Value |
| --- | --- |
| Largest message | 32 KB |
| Messages per connection | 20 a second on average, bursts up to 60 (subscribing and sending alike); over it, `LIMITED` |
| Subscriptions per connection | 100 |
| Connections per account | 10; the oldest is closed for a new one |

## Errors

Subscribing, unsubscribing and sending are acknowledged with `{ ok: true, result? }` or `{ ok: false, code, message }`:

| Code | Meaning |
| --- | --- |
| `INVALID` | Malformed, or the payload or presence metadata doesn't match the channel |
| `NOT_FOUND` | No such channel, or no such message on it |
| `FORBIDDEN` | Not allowed; also sending on a channel the connection isn't subscribed to |
| `LIMITED` | Too many messages or subscriptions |
| `FAILED` | The handler failed |

## In the browser

Both apps render `RealtimeProvider` (from `@inithium/shared-realtime`) inside the store's `Provider`. It holds the app's **one connection**, which opens on the first subscription, or at once while someone is signed in (`setKeepOpen()`), so they count as [present](presence.md). Each channel is subscribed once however many components listen, and the connection reopens when the signed-in user changes.

```tsx
import { useChannel, usePresence, useRealtimeStatus } from '@inithium/shared-realtime';

function GameRoom({ code, nickname }: { code: string; nickname: string }) {
  const players = usePresence(gameRoomChannel, { code }, { nickname });
  const { state, send } = useChannel(gameRoomChannel, { code }, {
    events: { 'round.started': ({ round }) => setRound(round) },
    onResubscribed: () => refetchGame(),
  });
  const status = useRealtimeStatus(); // 'idle' | 'connecting' | 'connected' | 'offline'

  const answer = async (text: string) => {
    const { accepted } = await send('answer.submit', { answer: text }); // rejects with RealtimeRequestError
  };
  // …
}
```

- `useChannel(channel, params, options)`: `params` null holds off subscribing. Options: `events` (handlers by type, each payload checked against the schema first), `invalidates` (RTK Query tags to invalidate on every event and after resubscribing), `onResubscribed`, `onPresence`, `meta`. Returns `{ state, send }`, where `state` is `subscribing`, `subscribed` or `refused` (with `code` and `message`). A refused subscription isn't retried until the connection reopens.
- `usePresence(channel, params, meta?)`: the channel's members.
- `useRealtimeStatus()`: the connection's status.
- `useUserPresence(userId)`: a user's status light, `{ color, label }` ([Presence](presence.md)).

To patch cached data from an event rather than refetch, dispatch to the feature's api, as the Pages list does with `setPageEditing()` (below).

## Core's channels

| Channel | Who may subscribe | Events |
| --- | --- | --- |
| `core:pages` (`pagesChannel`) | `pages.edit` | `editing.changed` `{ pageId, editing }`: someone opened a page in the page builder, or let it go |
| `core:user-status/<userId>` (`userStatusChannel`) | Anyone, guests too; dev accounts only for dev | `status.changed` `{ status, detail? }`: the user's [presence status](presence.md), sent at once and on each change |
| `core:content-lock/<pageId>/<lockId>` (`contentLockChannel`) | The user holding that live lock, from that session | `edit.requested` `{ from: { userId, name }, at }`: someone asked for the page |

Both are served from `@inithium/api-pages` (`pagesRealtimeChannels`); see [Pages](pages.md#the-edit-lock) and [0122](../decisions/0122-ask-the-person-editing-a-page-to-make-way.md).

## Scaling out

Published events travel through a `RealtimeBroker` (`publish(message)`, `subscribe(listener)`), which `startRealtime({ broker })` takes. Core ships `createMemoryBroker()`, the default, since every client runs one api instance. When a client first needs more than one, a **MongoDB change-streams** broker will implement the interface, using the cluster the client already has; it must also share presence, which is held per instance today.

## Testing

`@inithium/api-testing` has a listening test server and a realtime test client:

```ts
const app = createTestApiWithAuth((api) => api.use('/pages', pagesRouter));
const server = await listenTestApi(app);
startRealtime(server.server, { channels: pagesRealtimeChannels });

const { client } = await signedInClient(app, 'editor');
const realtime = await connectTestRealtime(server, client); // or without a client, as a guest
expect(await realtime.subscribe(pagesChannel.name())).toEqual({ ok: true });
// … change something over HTTP with `client` …
expect(await realtime.nextEvent()).toMatchObject({ type: 'editing.changed' });

realtime.close();
await stopRealtime(); // closes the server too
await server.close();
```

The test client records `events`, `presence` and `reauths`, and has `subscribe()`, `unsubscribe()`, `send()`, `activity()`, `nextEvent()`, `nextPresence()` and `disconnected()`. See [Testing](../getting-started/testing.md).
