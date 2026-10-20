---
id: "0119"
title: Let each user choose light or dark mode, stored on their account
status: accepted
date: "2026-10-20"
scope: core
tags: [ui, theme, colour, dark-mode, users, settings, lint]
related: ["0032", "0031", "0033", "0040", "0054", "0065", "0087", "0088", "0090", "0114"]
supersedes: []
---

# 0119. Let each user choose light or dark mode, stored on their account

## Context

[0032](0032-dark-mode-mirrors-the-theme-scales.md) decided how dark mode looks: every theme scale mirrors around 500. Every UI built since uses the token roles (backgrounds 50–400, borders 500, text 600–950), so mirroring flips it with no per-component code. 0032 left open how a user switches modes and where the choice is stored. Two more questions came up when building it:

- The page mustn't flash light before a dark-mode user's page is drawn. The theme's colours are written by React, and the account is only known once `/api/auth/me` answers.
- Not every client wants dark mode on their site.

## Decision

**What mirrors**
- Only the theme's six tokens mirror (50 ↔ 950, 100 ↔ 900 … 500 stays). **Tailwind's palette colours never mirror**: dark mode alters the theme only.
- Nothing in the theme is fixed: text on a brand colour (Button's `[color]-100`, Checkbox's tick, Switch's thumb) mirrors too. This replaces [0054](0054-style-buttons-by-variant-from-one-colour.md)'s "light text stays light in both modes" and settles [0033](0033-ui-library-design-open-questions.md)'s question about text on brand colours in dark mode. A colour that must stay the same in both modes is a Tailwind colour.
- `themeToCss()` writes the scales on `:root` and the mirrored scales under `:root[data-theme="dark"]` (with `color-scheme: dark`). The page is in dark mode while `<html>` carries `data-theme="dark"`.

**The choice**
- Three options: **System** (follow the device), **Light**, **Dark**.
- Stored per account in a private `preferences` subdocument on the user (`preferences.colorScheme`, default `system`), apart from the public `profile`. It comes back from `GET /api/auth/me`, and `PATCH /api/profiles/me/preferences` changes it.
- The owner changes it on a new **Settings** tab of their profile (gear icon, after Account). The password change moved there from the Account tab, which now has a user icon.
- The CMS follows the same account's preference.

**Signed out**
- The browser keeps the last signed-in user's choice in `localStorage` (`inithium-color-scheme`). Signing out leaves it as it is, and visitors can't change it. Only clearing the browser's storage resets it.
- Signing in replaces it with the account's preference. Signing up saves the browser's current choice as the new account's.

**No light flash**
- A small inline script runs first in each app's `<head>`: `colorSchemeScript()` from `@inithium/shared-ui-theme`, pasted into `index.html`. It sets `data-theme="dark"` from `localStorage` before anything is drawn. `theme.css` gives `:root[data-theme='dark']` the browser's dark canvas until the app publishes the scales.
- A cookie (offered as an option) isn't needed: the script reads `localStorage` before the first paint just as well, and the server can't resolve `system` anyway.

**The site switch**
- Site settings gain `darkMode` (on by default; `settings.edit`, so owners and admins). Off means:
  - everyone is drawn in light mode;
  - the Settings tab hides the choice;
  - users' stored preferences are kept for when it's back on.
- The api writes `data-dark-mode="on|off"` on each served page's `<html>`, so the script obeys it before the first paint. The Vite dev servers don't, so the last answer is also kept in `localStorage` (`inithium-dark-mode`).

**Logos**
- Settings gain an optional **dark mode logo**.
  - Dark mode draws the site's dark logo, else the site's own logo, and only without either Inithium's dark logo (`defaultLogoDark`).
  - Light mode is unchanged.
- It blocks deleting its asset like the logo.

**The docs app**
- A Dark mode switch beside the search box. It starts light and is kept in the browser, since the docs app has no accounts.

**Keeping it that way**
- A lint rule, `inithium/no-fixed-colors` in `core/eslint.config.mjs`, refuses hex colours and `white`/`black` in strings and template text in every project, plugins and client libs included. Shadows' `rgb(0 0 0 / …)` and pictures drawn as inline SVG are allowed.
- Files whose subject is raw colour turn the rule off in their project's own ESLint config: the theme's defaults and generator, hex validation, and measuring drawn colours.

## Alternatives considered

- **Mirroring Tailwind's palettes too:** rejected by the user; dark mode is meant to alter the theme only.
- **Keeping text on brand colours un-mirrored (as 0054 required), through fixed variables:** offered; the user chose to let it flip. Rationale not recorded.
- **Only Light and Dark:** System was added so a device's setting is followed by default.
- **A Light/Dark switch for signed-out visitors:** rejected; they keep the last signed-in user's choice.
- **A non-httpOnly theme cookie read by the server:** offered and accepted if it helped; it doesn't, since the inline script has `localStorage` before the first paint and `system` can only be resolved in the browser.
- **Holding the first paint until `/api/auth/me` answers:** not needed. The browser already stores the account's choice at sign-in, so only a change made on another device shows late, once.
- **Seeding the dark logo as an asset:** Inithium's default logos are files bundled with the theme lib, not database records; the dark one follows the light one.

## Consequences

- Every UI must keep to the roles: theme backgrounds from 50–400, text from 600–950, borders 500, and Tailwind colours only where something should stay the same in both modes. The lint rule catches fixed colours in code; it can't catch a wrong step (e.g. text in surface 200).
- The page backdrop (surface 950) and the Login and Sign up pages' surface 950 background are light in dark mode, as mirroring implies. The startup loader sits on the backdrop, so a dark-mode visitor sees a light loading screen.
- Each app's `index.html` carries a copy of the script; a spec in `@inithium/shared-ui-theme` fails if a copy drifts from `colorSchemeScript()`.
- The page builder's preview copies `<html>`'s attributes, so it shows the page in the editor's own mode. A light/dark preview switch isn't planned yet.
- A user who changes their preference on another device sees their old choice on this one until `/api/auth/me` answers.
