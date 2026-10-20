---
title: Dark mode
description: How dark mode mirrors the theme, how each user chooses it, how the page avoids a light flash, the site switch, and the rules that keep every UI working in both modes.
scope: core
tags: [ui, theme, colour, dark-mode]
order: 1
decisions: ["0032", "0119"]
---

# Dark mode

Dark mode draws the site, the CMS and the docs app with the theme's scales read from the other end ([0032](../../decisions/0032-dark-mode-mirrors-the-theme-scales.md), [0119](../../decisions/0119-let-each-user-choose-light-or-dark-mode.md)). Nothing in a component handles it: UI that keeps to the [surface roles](index.md#surface-roles) flips on its own.

## What changes

Every theme token's scale mirrors around 500:

| Step written | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dark mode draws | 950 | 900 | 800 | 700 | 600 | 500 | 400 | 300 | 200 | 100 | 50 |

- **Backgrounds (50–400) turn dark and text (600–950) turns light.** Every text/background pair is the same two colours swapped, so the surface's contrast guarantee holds in both modes.
- **A brand colour's 500 is unchanged**, so the client's chosen colours look the same. Text on it (a filled Button's `[color]-100`, a Checkbox's tick) mirrors like everything else in the theme.
- **Tailwind's colours never mirror.** `{ color: 'emerald', intensity: 600 }` is the same in both modes. Use one only for something that must not change, like the Modal's dark overlay.
- **The backdrop flips too:** `web`'s page backdrop and the Login and Sign up pages' default background are surface 950, so they're light in dark mode, and so is the startup loader on the backdrop.

`themeToCss()` writes the scales on `:root` and the mirrored ones under `:root[data-theme="dark"]` (with `color-scheme: dark`, so scrollbars and form controls follow). The page is dark while `<html>` carries `data-theme="dark"`.

```css
:root { --color-surface-100: #f8fafc; … }
:root[data-theme="dark"] { color-scheme: dark; --color-surface-100: <surface 900>; … }
```

## Who chooses

| Where | The choice | Kept in |
| --- | --- | --- |
| `web` and the CMS, signed in | **System** (follows the device), **Light** or **Dark**, on the profile's **Settings** tab | The account: `preferences.colorScheme` (default `system`) |
| `web` and the CMS, signed out | The last signed-in user's choice; visitors can't change it | `localStorage` `inithium-color-scheme` |
| The docs app | A **Dark mode** switch beside the search box, light until flipped | `localStorage` `inithium-color-scheme` |

- **Signing in** replaces the browser's choice with the account's.
- **Signing out** leaves it as it is.
- **Signing up** saves the browser's current choice as the new account's.
- Clearing the browser's storage is the only way to reset it.
- The CMS follows the same account, so a user's choice holds in both apps. The page builder's preview copies `<html>`'s attributes, so it shows the page in the editor's mode.

Preferences are private: they come back from `GET /api/auth/me` (`user.preferences`) and change through `PATCH /api/profiles/me/preferences`, never on the public profile ([Profiles](../../backend/profiles.md)).

## The site switch

Settings has a **Dark mode** section with **Offer dark mode** (`darkMode`, on by default, needs `settings.edit`) ([Site settings](../../backend/site-settings.md)). Off:
- everyone sees light mode;
- the profile's Settings tab hides the choice;
- people's stored choices are kept for when it's back on.

Settings also takes an optional **dark mode logo**. In dark mode the Navbar shows it, else the site's logo, and only with neither Inithium's `defaultLogoDark`. `siteLogo(settings, scheme)` picks it.

## No light flash

The theme's colours are written by React, after the scripts load, and the account is known only once `/api/auth/me` answers. So the scheme is applied earlier:

1. **Each app's `index.html` runs a small script first** (`colorSchemeScript()`, pasted in), before anything is drawn. It reads `inithium-color-scheme` (or the app's default: `system`, or `light` for the docs app) and sets `data-theme="dark"` when that, or the device for `system`, asks for dark.
2. **The api tells it whether dark mode is allowed:** it writes `data-dark-mode="on|off"` on every page it serves (`renderAppPage()` in `@inithium/api-settings`). The Vite dev servers don't, so the last answer is also stored (`inithium-dark-mode`).
3. **`theme.css` gives a dark page the browser's dark canvas** until the app publishes the scales.
4. **`useColorScheme()` takes over** once the app runs. It follows the account, the device and the site switch, and stores the account's choice so the next first paint is already right.

If `index.html` changes, keep the script exactly as `colorSchemeScript()` returns it: a spec in `@inithium/shared-ui-theme` compares each app's copy.

## Building UI that works in both modes

- **Use the roles:** theme backgrounds at 50–400, text at 600–950, borders at 500, brand colours at 500.
- **No fixed colours in code:** no hex codes, no `white` or `black`. The `inithium/no-fixed-colors` lint rule refuses them in strings and template text in every project, plugins and client libs included. It allows shadows' `rgb(0 0 0 / …)` and pictures drawn as inline SVG. A file whose subject is raw colour turns it off in its project's `eslint.config.mjs` with a comment saying why ([Conventions](../../reference/conventions.md#theme-colours)).
- **Tailwind colours only on purpose**, for what must look the same in both modes.
- **Something that must differ by mode** (e.g. a logo) reads `useAppliedColorScheme()` rather than owning the choice.
- **Check it:** flip your profile's Settings tab to Dark, or the docs app's switch for examples.

## API

From `@inithium/shared-ui-theme`:

| Export | Description |
| --- | --- |
| `useColorScheme({ enabled?, account?, fallback? })` | Applies the scheme; use it once per app, at its root (`web`'s `SiteShell`, the CMS's `CmsTheme`, the docs app's layout). `enabled` is the site switch (left out until known: the stored answer), `account` the signed-in user's preference (it wins and is stored), `fallback` the preference with nothing stored (default `system`). Returns `{ preference, resolved, enabled, setPreference }`; `setPreference` stores a browser-only choice (the docs app's switch). |
| `useAppliedColorScheme()` | `'light'` or `'dark'`: the scheme on screen, for components that draw something different in dark mode. |
| `colorSchemeScript(fallback)` | The first-paint script's source, for `index.html`. |
| `resolveColorScheme(preference, { enabled, systemDark })` | The scheme to draw. |
| `readStoredColorScheme()` / `storeColorScheme(scheme)` | The browser's stored choice. |
| `readStoredDarkMode()` / `storeDarkMode(enabled)` | Whether dark mode is allowed, from the page or the browser. |
| `applyColorScheme(scheme)` | Sets or removes `data-theme="dark"` on `<html>`. |
| `mirroredStep(step)` | The step dark mode draws for a step (e.g. 100 → 900). |
| `DARK_THEME_SELECTOR` | `:root[data-theme="dark"]`. |
| `defaultLogoDark` / `siteLogo(settings, scheme)` | Inithium's dark logo; the logo to draw in a scheme. |
| `COLOR_SCHEME_STORAGE_KEY` / `DARK_MODE_STORAGE_KEY` | `inithium-color-scheme` / `inithium-dark-mode`. |

From `@inithium/shared-contracts`: `colorSchemes` (`['system', 'light', 'dark']`), `colorSchemeSchema`, `userPreferencesSchema`, `updatePreferencesRequestSchema`, `DEFAULT_USER_PREFERENCES` and the types `ColorScheme`, `UserPreferences`, `UpdatePreferencesRequest`. From `@inithium/shared-data-access`: `useUpdateMyPreferencesMutation()`, which updates the current user at once (so the page switches immediately) and undoes it if the request fails.
