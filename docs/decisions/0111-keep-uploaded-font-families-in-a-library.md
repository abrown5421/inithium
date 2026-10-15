---
id: "0111"
title: Keep uploaded font families in a library that the theme and pages pick from
status: accepted
date: "2026-10-15"
scope: core
tags: [ui, theme, typography, fonts, assets, cms]
related: ["0046", "0082", "0087", "0098", "0112", "0113", "0114"]
supersedes: []
---

# 0111. Keep uploaded font families in a library that the theme and pages pick from

## Context

The theme has two font roles, `display` (branding, logo-style headings) and `body` (everything else), and a client can replace either by uploading a font ([0046](0046-theme-fonts-display-and-body.md)). Font files can already be uploaded as assets with the `font` purpose: WOFF2 and WOFF, TTF and OTF converted to WOFF2, with a licence checkbox ([0098](0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)). Nothing uses them yet: "font families" is step C of the assets build.

A font is rarely one file. A family has a file per weight and style (Regular, Bold, Italic…) or one variable file covering a weight range. Text accepts weights 100–900 and italic, so a family holding only a Regular file would get bold and italic faked by the browser.

Clients also want fonts beyond the two roles for particular content, chosen in the page builder ([0113](0113-choose-typography-in-the-page-builder-per-block-and-per-word.md)).

## Decision

**Fonts come from uploads only.** There's no font catalogue (Google Fonts or other) and no fonts loaded from a third-party server.

**A font family is a record** in the api (a `font_families` collection):
- a **name**, prefilled from the file's own family name and editable;
- a **fallback type**, `sans`, `serif` or `mono`, which picks the generic family in its CSS stack;
- its **files**, each a `font` asset with a **weight** (one value, or a range for a variable font) and a **style** (`normal` or `italic`). Weight and style are **read automatically from each file** (the font's own metadata, including a variable font's weight axis), never typed in. Two files with the same weight and style can't be in one family.

**The library holds at most six uploaded families.** That's enough for the two theme fonts plus four others. Inithium's two default families are built in and don't count.

**The theme points its roles at families.** Settings stores the `display` and `body` choice as family ids beside the theme's colours; leaving one out means Inithium's default. Reset goes back to the defaults. Every UI keeps reading `--font-display` and `--font-body`, so nothing in the components changes when a client swaps a font.

**Every font is served under an internal name**, `Inithium Font <familyId>`, never the font's own name. That keeps a Reserved Font Name (e.g. Merriweather) off modified web copies, the same way the defaults are served as `Inithium Display` / `Inithium Body`.

**Both apps use the client's fonts.** `web` and the CMS draw with the client's theme fonts, as they already do with its colours. If the client picks a font that's hard to read, that's the client's choice; Settings shows a note beside the body font that it's used for all running text.

**Every uploaded family is available in the page builder**, beside the two roles ([0113](0113-choose-typography-in-the-page-builder-per-block-and-per-word.md)).

**Plugins reference only the roles** (`display`, `body`) in their code, never a library family. Content a plugin renders through the shared content renderer can still carry family choices made in the CMS.

**Deleting**
- A family the theme uses can't be deleted (409), like the logo's asset.
- A family used only in page content (draft or published) warns with where it's used; that text then falls back to `body`.
- `assetUsage()` covers families in the theme, in blocks and inside rich text.

**Who does what**
- Adding, editing and removing families: `assets.upload` (owner, admin, editor); deleting their files needs `assets.delete` (owner, admin), as for every asset.
- Choosing the theme's `display` and `body`: `settings.edit` (owner, admin).

**The Media screen groups a family's files** under the family instead of listing them as loose files.

**Picking a font** is done with two new composites, modelled on `AssetPicker` / `AssetField`: a **FontPicker** listing "Display (theme)" and "Body (theme)" first, then the library's families, each drawn in its own font; and a **FontField** form field holding one choice.

**Build order:** (1) family records, file metadata, the api and the Media screen's grouping; (2) theme roles in Settings and loading the fonts without a flash ([0114](0114-load-the-clients-fonts-without-a-flash.md)); (3) FontPicker and FontField, and library families in Text ([0112](0112-give-text-typography-props-with-library-font-families.md)); (4) the page builder's block-level and per-word typography ([0113](0113-choose-typography-in-the-page-builder-per-block-and-per-word.md)).

## Alternatives considered

- **A font catalogue such as Google Fonts:** not chosen; uploads only. Loading fonts from Google's servers would send visitors' IP addresses to Google, which would need the privacy policy and CSP changed.
- **No limit on the library:** not chosen; most sites use two or three typefaces, and a cap keeps pages from drifting toward a different font each. Every family declared costs nothing on pages that don't use it, so the cap is about design, not speed.
- **Keeping Inithium's fonts in the CMS** so a hard-to-read client font can't affect the admin screens: not chosen; readability is the client's responsibility.
- **One font file per family:** not chosen; browsers fake missing weights and italics.

## Consequences

- The api needs a font metadata reader (weight, style, variable weight axis, family name, and the metrics [0114](0114-load-the-clients-fonts-without-a-flash.md) uses for fallback sizing).
- Settings' contract grows the two role ids, and the site bundle (`GET /api/site`) must carry each family's files so both apps can declare `@font-face` rules.
- `fontFamilySchema` changes from two names to the roles plus family references ([0112](0112-give-text-typography-props-with-library-font-families.md)).
- 0046 stays in force: the theme still has exactly two roles, with core defaults a client can replace.
