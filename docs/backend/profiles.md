---
title: Profiles
description: Every account's profile, its generated avatar and banner, the profile API, and the Profile page with its viewers and slots.
scope: core
tags: [profiles, users, backend, pages, slots]
order: 10
decisions: ["0074", "0075", "0081", "0090", "0091", "0098", "0099"]
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
| `avatarAssetId` | string, optional | An uploaded picture shown instead of the generated avatar ([0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)). |
| `bannerAssetId` | string, optional | An uploaded picture shown instead of the generated banner. |

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

- **`PublicProfile`** (`publicProfileSchema`): `id`, `firstName?`, `lastName?`, `bio?`, `avatar`, `banner`, `avatarAssetId?`, `bannerAssetId?`, `joinedAt` (ISO), and `email` only when the viewer is the profile's owner. The route reads the session with `readAuth(req)` from `@inithium/api-auth`, which never rejects a request.
- **`UpdateProfileRequest`** (`updateProfileRequestSchema`): any of `firstName` (1–50), `lastName` (up to 50), `bio` (up to 280), `avatar`, `banner`, `avatarAssetId`, `bannerAssetId`; unknown keys are rejected. Fields left out stay as they are; an empty `lastName` or `bio` removes it. Text is trimmed. An asset id must be the user's own upload of that kind (`400` with `field` otherwise); `null` goes back to the generated picture. A picture that's replaced or removed is deleted.

From the frontends, use `useGetProfileQuery(id)` and `useUpdateMyProfileMutation()` from `@inithium/shared-data-access` ([Calling the API](calling-the-api.md)). A saved edit goes straight into that profile's cache entry, and the current user refetches so the Navbar's name and avatar follow.

## The Profile page

Core's `profile` template (`ProfilePage` in `@inithium/web-pages`) draws the seeded Profile page (`/profile/:id`) in the `full-width` layout, with [ProfileLayout](../ui-library/layouts/profile-layout.md) as its frame.

### Viewers

The page works out who is looking (`ProfileViewer`):

| Viewer | Who | Sees |
| --- | --- | --- |
| `visitor` | Signed out | Banner, avatar, name, bio and join date |
| `member` | Signed in, someone else's profile | The same as a visitor in core; plugins may show more |
| `owner` | The profile's own account | Also their email, edit buttons on the avatar and banner (saved straight away), the Account tab's form, and a prompt to add a name if they have none |

Staff accounts have profiles like everyone else, and no role is shown.

### Core's tabs, sections and actions

| Slot | Entry | Viewers | Order |
| --- | --- | --- | --- |
| Sidebar section | **About**: the bio, the join date, and the email for its owner | everyone | 0 |
| Tab | **Account**: the editable form, with names, bio, the email (read-only) and a password change (`PasswordChangeForm`) | owner | 1000 |

Core has no other tabs and no header actions: the owner never has to press a button to start editing, because the form is already there.

The main column (surface 200) holds **cards**: the tab bar (Tabs' [`bar`](../ui-library/composites/tabs.md#bar)), and in the Account tab one card for the profile form and one for the password, 24px apart. Each is surface 100 with padding, 12px corners and the sidebar's `2xl` shadow. Their props are exported as `profileCard` (and the gap as `PROFILE_CARD_GAP`) from `@inithium/web-pages`; spread `profileCard` onto a Container so a plugin tab's sections match.

- **Tabs are in the URL** as `?tab=<key>`, e.g. `/profile/:id?tab=account`. An unknown or hidden tab opens the first visible one. The tab bar shows whenever there's a tab; with none (visitors and members, until plugins add some), the main column says there's nothing to show yet.
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

## Uploaded pictures

With `STORAGE_MODE=cloud-all` ([Assets](assets.md#members-pictures)), an owner can show an uploaded picture instead of their generated avatar or banner ([0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)):

- The avatar's and the banner's editors gain **Upload a picture**. It opens the upload form, cropped to a circle or 4:1, and the result is attached with `PATCH /api/profiles/me`.
- The picture shows on the profile and in the Navbar. `profileImage(assetId)` from `@inithium/shared-contracts` turns the id into the `{ src }` the Avatar, PolyBanner, ProfileLayout and Navbar take.
- If it fails to load, the generated one shows: the recipe is always kept.
- With a picture showing, the editor says so, and saving there (**Use this avatar** / **Use this banner**) goes back to the generated one and deletes the picture.
- In the other modes, the editors look as they always have, and pictures already attached keep showing while their files exist.

## Not built yet

- **Changing the email:** this needs email verification.
- **Privacy settings.**
- **Usernames in profile addresses:** ids are MongoDB ids for now.
