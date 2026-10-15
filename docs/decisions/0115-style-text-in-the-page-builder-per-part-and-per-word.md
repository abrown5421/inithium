---
id: "0115"
title: Style text in the page builder per text part and per word, leaving buttons out
status: accepted
date: "2026-10-15"
scope: core
tags: [cms, content, rich-text, typography, fonts, editor]
related: ["0054", "0067", "0093", "0094", "0102", "0111", "0112"]
supersedes: ["0113"]
---

# 0115. Style text in the page builder per text part and per word, leaving buttons out

## Context

[0113](0113-choose-typography-in-the-page-builder-per-block-and-per-word.md) decided that every text part of every content block, button labels included, gets a font, weight, size and colour, and that rich text gets a mark for restyling individual words. When it came to building it, buttons didn't fit: Button has a fixed 32px height and 14px text ([0054](0054-style-buttons-by-variant-from-one-colour.md)), and a button's colour already comes from its own `color`. Building it also settled details 0113 left open: how colour fits blocks that already have a `textColor`, the shape of a size, and how a relative size is drawn.

## Decision

Everything in 0113 stands, except for buttons and with these details settled:

**Buttons are left out.** Button labels keep the theme's body font, Button's fixed size and the button's own colour. Only text parts get typography.

**Every other text part can be styled** with an optional `contentTypographySchema` object: **font family** (a role or `{ familyId }`, [0112](0112-give-text-typography-props-with-library-font-families.md)), **weight** (100–900) and **size** (`{ base, md? }` in px, 8–160, `md` applying from the medium breakpoint up). Left out, each part keeps today's look.

| Block | Typography | Colour |
| --- | --- | --- |
| Heading | `typography` | `textColor` (existing) |
| Rich text | `typography`, for the running text; sub-headings inside keep the display font and their sizes | `textColor` (existing) |
| Feature | `titleTypography`, `textTypography` | `titleColor`, `textColor` (new) |
| Banner | `headingTypography`, `textTypography` | `textColor` (existing, shared by both) |
| Image | `captionTypography` | `captionColor` (new) |

Colour stays a field of its own on each block, so no part has two colour settings. Text parts added to blocks later get the same fields.

**Rich text gets a `textStyle` mark** for restyling selected words: `{ type: 'textStyle', attrs: { family?, weight?, size?, color? } }`, with at least one attribute.
- `family` is the same value as a block's font.
- `size` is a ratio of the surrounding text, 0.5–3, offered as presets (`richTextSizePresets`: 0.75, 0.875, 1.25, 1.5, 2), so restyled words scale with a responsive heading.
- `color` is a colour value ([0067](0067-colour-values-with-the-full-palette-in-cms-controls.md)), stored as a reference.
- Bold stays a toggle (700). When a run has both bold and a weight, the weight wins.
- The editor's weight list only offers weights the chosen font has.

**Text gets a `fontScale` prop**, a size relative to the surrounding text (resolved as `em`), which draws the mark's size. It wins over `fontSize` when both are set.

**The editor uses its own TipTap mark** (`inithiumTextStyle`), not TipTap's font and colour extensions, which store raw CSS. It holds the contract's references, draws them through the theme's CSS variables, checks its attributes against the contract before drawing them, and converts one-to-one in `richTextToTiptap` / `tiptapToRichText`.

**The toolbar** gets **Text style**, a dialog with the font (FontField), a weight, a size preset and a colour, each defaulting to "Same as the text", plus **Clear style**. With text selected it styles the selection. With the cursor inside restyled words it changes those words. Otherwise it styles what's typed next.

**Pasted styling is dropped:** the mark only reads back its own spans, so fonts, sizes and colours pasted from elsewhere are removed (bold and italic survive).

**Limits:** `richTextFeatures` gains `fontFamily`, `fontWeight`, `fontSize` and `textColor`, each allowed separately, and `restrictedRichTextSchema` enforces them on the api. The profile bio allows none. RichTextField has no styling tools, so fields built on it don't offer these features.

**Rendering:** `RichTextView` and `ContentRenderer` draw everything with Text, so `web` and the editor preview stay on one renderer.

**Font families in content:** removing a family warns with the pages that use it, in a block or in restyled words (`GET /api/fonts/:id/usage`). That text then draws in the body font.

## Alternatives considered

- **Font and weight on buttons** (Button extended with `fontFamily` and `fontWeight`, size and colour unchanged): offered; the user chose to leave buttons out.
- **Font, weight and size on buttons**, with Button's height growing with its text: offered; not chosen, and it would have changed 0054.
- From 0113: one font per rich-text block with no per-word styling, per-word sizes in pixels, and TipTap's own font and colour extensions: not chosen, for the reasons recorded there.

## Consequences

- Every new field is optional, so stored content stays valid and `schemaVersion` doesn't change.
- `fontScale` joins Text's style props, so the CMS's style-prop sheet carries it.
- A plugin's own text blocks, when there are any, should use `contentTypographySchema` the same way.
