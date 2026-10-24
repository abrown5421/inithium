---
title: Presence
description: Users' status lights - core's active, inactive and away statuses, the status registry plugins add to, setting statuses from the api, and showing them in the frontends.
scope: core
tags: [api, realtime, presence, profiles, plugins]
order: 14
decisions: ["0124", "0121", "0015"]
---

# Presence

Every user has a **status**, shown as a coloured light on their avatar with its name in a tooltip ([0124](../decisions/0124-show-who-is-online-with-a-status-light-on-avatars.md)). Statuses are built on the [realtime layer](realtime.md): a user's open connections say whether they're on the site and whether they're using it.

## Core's statuses

| Key | Light | Name | When |
| --- | --- | --- | --- |
| `active` | green 500 | Active | Signed in, with input in the last 10 minutes on any tab or device |
| `inactive` | yellow 500 | Inactive | Signed in and connected, but no input for 10 minutes or more |
| `away` | surface 500 | Away | Not on the site: signed out, or every tab closed |

- **Activity** comes from the browser: it keeps the time of the last input and checks every 15 seconds; after `REALTIME_IDLE_AFTER_MS` (10 minutes) without input it reports idle, and active again on the next input. This runs from the moment the page connects, so a hidden tab, even one opened or reloaded in the background, goes idle on the same clock; switching tabs isn't leaving.
- **What counts as input:** pointer presses, keys, touches, and pointer moves and wheel turns **while the window has focus**, caught before any component can stop them. A cursor crossing a window you're not using doesn't count, nor does a "move" to the same spot (browsers send one when the page changes under a resting cursor), nor does a tab becoming visible (on Windows, browsers report a covered window as hidden, so moving other windows around would otherwise count).
- **Checking it:** each change is logged in the browser console at the Verbose level, e.g. `[realtime] idle: no input for 10 minutes` or `[realtime] active: pointerdown`.
- **Leaving takes 5 seconds:** a user whose last connection closes shows as Away only after `PRESENCE_OFFLINE_GRACE_MS` (5 seconds) without reconnecting, so a browser reconnecting (e.g. refreshing its session as the access token expires) doesn't flash Away. Their plugin statuses are cleared then.
- **Reconnecting** (e.g. when the access token expires and the session is refreshed) keeps the activity: the browser sends it in the handshake's `auth` (`{ activity }`), so an idle user doesn't flash Active.
- **A signed-in user's browser stays connected** while it's open, whether or not anything subscribes (`RealtimeProvider` calls `setKeepOpen(true)`), so they count as present.
- **Several tabs or devices** count as one: active if any of them is, away only once the last one closes.
- Sessions that must change their password first connect as guests, so they show as away.

## The status registry

Statuses are definitions, from `definePresenceStatus()` in `@inithium/shared-contracts`:

```ts
export const inClassStatus = definePresenceStatus({
  key: 'plugin-classes:in-class', // plugin-<name>:<status> or client-<name>:<status>
  label: 'In a class',
  color: 'violet', // a solid colour value
  priority: 10, // between plugin statuses set at once, the highest wins
});

export const playingStatus = definePresenceStatus({
  key: 'client-games:playing',
  label: (game) => (game ? `Playing ${game}` : 'Playing'), // from the detail the setter gives
  color: { color: 'sky', intensity: 500 },
  priority: 20,
});
```

Core's three are `corePresenceStatuses` (`activeStatus`, `inactiveStatus`, `awayStatus`). Their keys are reserved. A plugin (or `libs/client/`) puts its definitions in its `contracts` lib and lists them as **`registeredPresenceStatuses` in all three apps' registries**: the api checks keys against them, and `web` and the CMS draw their colours and names. Each app calls `registerPresenceStatuses()` at startup, which refuses a key used twice, a core key or a key without a namespace ([0015](../decisions/0015-slot-catalogue.md)). `findPresenceStatus(key)` reads the registry, and `presenceLight(status)` gives the `{ color, label }` to draw. A status nobody registers any more (its plugin ejected) draws as Active.

## Setting a status

Plugin and client api code sets and clears its own statuses with `@inithium/api-presence`:

```ts
import { clearUserStatus, setUserStatus } from '@inithium/api-presence';

setUserStatus(userId, 'plugin-classes:in-class'); // false, doing nothing, if they aren't online
setUserStatus(userId, 'client-games:playing', { detail: 'Trivia Night' }); // detail: up to 60 characters
clearUserStatus(userId, 'client-games:playing');
```

- A set status **replaces Active and Inactive** while it's set. The user still shows as Away once their last connection closes, and **every status they had is then cleared**: set it again when they're back (e.g. when they rejoin the class).
- With several set at once, the one with the highest `priority` shows.
- The key must be registered and namespaced; anything else throws.

`userStatus(userId)` gives a user's status now (`{ status, detail? }`). Statuses are held in the api's memory, like connections: there's no "last seen" or history, and a restart starts everyone as away until their browsers reconnect, which they do by themselves.

## Following a status

`core:user-status/<userId>` (`userStatusChannel`) carries one user's status: a new subscriber gets `status.changed` with the status at once (the channel's `snapshot`), then one for each change. Anyone may follow anyone, guests included, whatever either's role (dev accounts too): only an account that doesn't exist is refused. The api side is `userStatusChannelServer`; `main.ts` starts presence with `startPresence()` before `startRealtime()`.

In the browser, `useUserPresence(userId)` from `@inithium/shared-realtime` follows the channel and returns `{ color, label }` (or undefined until known), ready for Avatar's [`presence`](../ui-library/composites/avatar.md#presence):

```tsx
const presence = useUserPresence(user.id);
return <Avatar value={user.avatar} presence={presence} name={name} />;
```

## Where core shows it

Everywhere a user's avatar is drawn:

- The **Navbar**'s own avatar, in `web` (`SiteShell`) and the CMS's top bar (`CmsShell`), through the Navbar's [`user.presence`](../ui-library/composites/navbar.md#user).
- The **Profile page**'s avatar, through ProfileLayout's [`avatarPresence`](../ui-library/layouts/profile-layout.md#avatarpresence) ([Profiles](profiles.md)).
- The CMS **Users** list and the user details dialog (`UserAvatar` in `@inithium/cms-users`).

Anything new that draws a user's avatar (core, plugin or client) passes `useUserPresence(userId)` as its `presence` too.
