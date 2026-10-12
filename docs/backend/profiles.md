---
title: Profiles
description: Every account's profile, its generated avatar and banner, the profile API, and the Profile page with its viewers and slots.
scope: core
tags: [profiles, users, backend, pages, slots]
order: 10
decisions: ["0074", "0075", "0081", "0090"]
---

# Profiles

Every account has a profile: names, a bio, an avatar and a banner. Anyone can view it at `/profile/:id`, and what each viewer sees depends on who they are ([0081](../decisions/0081-extend-the-profile-page-through-slots-by-viewer.md), [0090](../decisions/0090-generate-and-show-user-profiles.md)).

## The profile data

The user's `profile` subdocument ([Users](users.md#profiles)), validated by `userProfileSchema` in `@inithium/shared-contracts`:

| Field | Type | Notes |
| --- | --- | --- |
| `firstName` | string, optional | Required at sign-up; missing on accounts created without one (e.g. the dev account) until their owner adds it. Up to 50 characters. |
| `lastName` | string, optional | Up to 50 characters |
| `bio` | string, optional | Up to 280 characters (`profileLimits.bio`) |
| `avatar` | `AvatarRecipe` | An [Avatar](../ui-library/composites/avatar.md) recipe. Always present. |
| `banner` | `PolyPattern` | A [PolyBanner](../ui-library/composites/poly-banner.md) recipe. Always present. |

Plugins never add to it; they keep per-user data in their own collections ([0026](../decisions/0026-plugins-keep-user-data-in-their-own-collections.md)).

### Generated on creation

No account is ever without a saved avatar and banner. `createUser()` in `@inithium/api-users` stores both when an account is created, whether by sign-up or as the seeded dev account:

- **Avatar** (`createProfileAvatar(id)`): the `initials` style on the `primary` background, seeded by the account's id.
- **Banner** (`createProfileBanner()`): random on every call.
  - Its `xColors` and `yColors` each hold 2–4 stops, each a random brand token (`primary`, `secondary`, `tertiary`, `quaternary`, `accent`) at a random intensity from 200 to 800.
  - Its cell size is random from 40 to 150px, its variance from 0.3 to 1, and it gets a random seed.
  - The colours are theme references, so a re-brand recolours every banner.

`backfillUserProfiles()` runs on every api start and gives any account without a stored avatar or banner its generated ones. Accounts created before profiles existed are covered on the next start. Owners change both from their Profile page.

### Names

- `profileName(profile)` gives the first and last name, or `undefined` when there are none.
- `publicProfileName(profile)` is what others see: the name, or **"Member"**. It never shows the email.
- `userDisplayName(user)` is what users see for themselves, e.g. in the Navbar: the name, or their email.

## API

| Route | Auth | Body | Success | Errors |
| --- | --- | --- | --- | --- |
| `GET /api/profiles/:id` | none (a session is read if present) | none | `200` `PublicProfile` | `404 { message }` for an unknown or malformed id |
| `PATCH /api/profiles/me` | `requireAuth` | `UpdateProfileRequest` | `200` `PublicProfile` (with the email) | `400` with Zod `issues`, `401`, `403 PASSWORD_CHANGE_REQUIRED` |

Both are in `profilesRouter` from `@inithium/api-profiles`, mounted at `/api/profiles`.

- **`PublicProfile`** (`publicProfileSchema`): `id`, `firstName?`, `lastName?`, `bio?`, `avatar`, `banner`, `joinedAt` (ISO), and `email` only when the viewer is the profile's owner. The route reads the session with `readAuth(req)` from `@inithium/api-auth`, which never rejects a request.
- **`UpdateProfileRequest`** (`updateProfileRequestSchema`): any of `firstName` (1–50), `lastName` (up to 50), `bio` (up to 280), `avatar`, `banner`; unknown keys are rejected. Fields left out stay as they are; an empty `lastName` or `bio` removes it. Text is trimmed.

From the frontends, use `useGetProfileQuery(id)` and `useUpdateMyProfileMutation()` from `@inithium/shared-data-access` ([Calling the API](calling-the-api.md)). A saved edit goes straight into that profile's cache entry, and the current user refetches so the Navbar's name and avatar follow.

## The Profile page

Core's `profile` template (`ProfilePage` in `@inithium/web-pages`) draws the seeded Profile page (`/profile/:id`) in the `full-width` layout, with [ProfileLayout](../ui-library/layouts/profile-layout.md) as its frame.

### Viewers

The page works out who is looking (`ProfileViewer`):

| Viewer | Who | Sees |
| --- | --- | --- |
| `visitor` | Signed out | Banner, avatar, name, join date, the About tab |
| `member` | Signed in, someone else's profile | The same as a visitor in core; plugins may show more |
| `owner` | The profile's own account | Also their email, edit buttons on the avatar and banner (saved straight away), "Edit profile", the Account tab, and a prompt to add a name if they have none |

Staff accounts have profiles like everyone else, and no role is shown.

### Core's tabs, sections and actions

| Slot | Entry | Viewers | Order |
| --- | --- | --- | --- |
| Tab | **About**: the bio, or a prompt for its owner to write one | everyone | 0 |
| Tab | **Account**: names, bio, the email (read-only) and a password change (`PasswordChangeForm`) | owner | 1000 |
| Sidebar section | **Details**: the join date, and the email for its owner | everyone | 0 |
| Header action | **Edit profile**: opens the Account tab | owner | 1000 |

- **Tabs are in the URL** as `?tab=<key>`, e.g. `/profile/:id?tab=account`. An unknown or hidden tab opens the first visible one, and the tab bar hides when only one tab is visible.
- **An unknown profile** shows the Not Found page in place, keeping the address.

### Adding to the profile

Plugins and `libs/client/` add tabs, sidebar sections and header actions through the web registry, `apps/web/src/app/plugins.registry.ts`, which core ships empty ([0090](../decisions/0090-generate-and-show-user-profiles.md)):

```ts
import type { ProfileSlots } from '@inithium/web-pages';
import { OrdersTab } from '@inithium/plugin-ecom-web';

export const registeredProfileSlots: ProfileSlots = {
  tabs: [{ key: 'orders', label: 'Orders', icon: 'package', order: 100, viewers: ['owner'], component: OrdersTab }],
  sidebarSections: [],
  headerActions: [],
};
```

Every entry (`ProfileSlotEntry`) has:

- `key`: unique within its slot; a tab's key is its `?tab=` value;
- `order`: position, lowest first (core's own use 0 and 1000);
- `viewers`: who sees it;
- `component`: gets `{ profile, viewer }` (`ProfileSlotProps`) and may render differently for each viewer.

`ProfileTab` adds a `label` and an optional `icon`, `ProfileSidebarSection` adds a `label` (its heading), and a `ProfileHeaderAction`'s component renders its own button. The app hands the registry to the page through `ProfileSlotsProvider`. A slot's data comes from the plugin's own endpoints, never from the profile or `/auth/me` ([0026](../decisions/0026-plugins-keep-user-data-in-their-own-collections.md)).

## Not built yet

- **Uploaded avatar and banner images:** these wait for assets and a scalable storage driver ([0028](../decisions/0028-store-assets-behind-pluggable-storage-drivers.md)).
- **Changing the email:** this needs email verification.
- **Privacy settings.**
- **Usernames in profile addresses:** ids are MongoDB ids for now.
