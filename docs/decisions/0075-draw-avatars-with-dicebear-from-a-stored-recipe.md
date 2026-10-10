---
id: "0075"
title: Draw avatars with DiceBear from a stored recipe, limited to 14 styles, in an Avatar composite
status: accepted
date: "2026-10-10"
scope: core
tags: [ui, composites, profiles, avatars, licensing]
related: ["0065", "0069", "0074"]
supersedes: []
---

# 0075. Draw avatars with DiceBear from a stored recipe, limited to 14 styles, in an Avatar composite

## Context

Profiles need generated avatars ([0074](0074-generate-banners-as-our-own-poly-pattern.md) plans a DiceBear recipe). Users should be able to choose and change theirs, and like PolyBanner, an Avatar needs an editor.

## Decision

- **Library:** DiceBear 10 (`@dicebear/core`, MIT), with style definitions from `@dicebear/styles`. Each definition loads on demand the first time its style is drawn; until then the circle shows its background.
- **Styles:** only `initials` (the default), `blobs`, `bottts`, `cameo`, `disco`, `gaze`, `glass`, `glyphs`, `landscape`, `loops`, `moods`, `patchwork`, `planets` and `rings`.
- **Licences:** twelve styles are CC0. Glyphs (CC BY 4.0, a remix of Matt Houser's "Abstract Avatars for All Creative Profile Use") and Bottts (Pablo Stanley, free for personal and commercial use) are credited on the manual page, and the editor shows the style's credit while either is chosen. Every SVG also carries its style's licence in its metadata.
- **Recipe:** `avatarRecipeSchema` in `@inithium/shared-contracts`: `style`, `seed`, and optional `backgroundColor` (a colour value, `'transparent'` for none, or left out for the style's own), `flip`, `rotate` (0–360°) and `scale` (50–200%). This is what profiles will store. Uploaded photos wait for assets.
- **Initials** draw the initials of a `name` prop (or the seed without one). Their circle's colour comes from the seed (a theme token or one of nine Tailwind colours, at 600), so the editor's arrows change the colour, not the letters.
- **Backgrounds** are drawn by our own circle in theme colours, so they follow a re-brand; DiceBear's background is dropped whenever ours is set. Styles without a background of their own sit on surface 200.
- **Avatar** (`@inithium/shared-ui-composites`): `value` / `defaultValue` / `onChange`, `width` and `height` (default 40px; keep them equal), margin, animation, `name` and `label` (otherwise decorative).
- **Editing:** with `editable`, a round pencil button on the circle's bottom-right edge (28px, 24px on avatars under 64px; filled surface 900 with a tooltip) opens a Modal ([0065](0065-open-modals-by-id-from-global-state.md)):
  - a 160px preview between ← and →, which step through a history of seeds starting at the saved one (→ makes a new random seed at the end; ← is disabled at the start); changing style keeps the seed;
  - all 14 styles as thumbnails drawn with the current seed, in a radio group;
  - Background (the style's own, none, or a colour from a ColorPicker ([0069](0069-pick-colours-from-swatches-and-an-intensity-slider.md))), Flip, and Rotate and Scale sliders;
  - Cancel and Save; changes stay in a draft until Save, which calls `onChange` with defaults left out.

## Alternatives considered

- **Every DiceBear style:** limited to the 14 chosen.
- **Controls for each style's parts (eyes, mouths, colours):** every style names them differently; left out for now.
- **A single `size` prop:** width and height match the other components.

## Consequences

- `core/tsconfig.base.json` sets `resolveJsonModule`, so the style definitions import with types.
- Profiles store an `avatarRecipeSchema` recipe and render it with Avatar.
- Alert's `image` (0066) can later take an Avatar recipe.
