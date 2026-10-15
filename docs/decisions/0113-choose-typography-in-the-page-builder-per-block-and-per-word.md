---
id: "0113"
title: Choose fonts, weights, sizes and colours in the page builder, per block and per word
status: superseded
date: "2026-10-15"
scope: core
tags: [cms, content, rich-text, typography, fonts, editor]
related: ["0067", "0093", "0094", "0102", "0111", "0112"]
supersedes: []
supersededBy: "0115"
---

# 0113. Choose fonts, weights, sizes and colours in the page builder, per block and per word

## Context

Content pages ([0093](0093-build-content-pages-from-sections-columns-and-blocks.md)) draw headings, banner titles and rich-text headings in `display` and everything else in `body`; the editor ([0094](0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md)) offers no font choice. Rich text is a TipTap JSON subset with the marks bold, italic, underline and link ([0102](0102-edit-rich-text-fields-with-tiptap-and-store-json.md)). Clients want to choose fonts from the library ([0111](0111-keep-uploaded-font-families-in-a-library.md)) anywhere text appears, down to individual words.

## Decision

**Every text part of every block can be styled.** The heading, banner title and subtitle, feature title and text, button labels, image captions and rich text each get optional **font family** (a role or a library family, [0112](0112-give-text-typography-props-with-library-font-families.md)), **weight**, **size** (pixels, responsive like other block sizes) and **colour** (a colour value, [0067](0067-colour-values-with-the-full-palette-in-cms-controls.md)). Left out, the part keeps today's default. Text parts added to blocks later get the same fields.

**Rich text gets a `textStyle` mark** for per-word styling, so a user highlights words and restyles just those:
- `{ type: 'textStyle', attrs: { family?, weight?, size?, color? } }`, with at least one attribute;
- `family` is the same value as the block-level choice;
- `size` is a **ratio of the surrounding text** (e.g. 1.5 or 0.8), offered as presets in the toolbar, so restyled words scale with a responsive heading; block-level sizes stay in pixels;
- `color` is a colour value stored as a reference, so theme colours follow a re-brand;
- **bold stays a toggle** (700); when a run has both bold and an explicit weight, the weight wins;
- the weight list only offers weights the chosen family has.

**The editor uses its own TipTap mark**, not TipTap's font and colour extensions, which store raw CSS (`"Georgia, serif"`, hex colours). The mark holds the contract's references, draws through the theme's CSS variables, and converts one-to-one in `richTextToTiptap` / `tiptapToRichText`, as page links do.

**The toolbar** gets the FontPicker, a weight list, size presets and the ColorPicker. With text selected they style the selection; with none they style what's typed next.

**Pasted styling is dropped:** fonts, sizes and colours pasted from elsewhere aren't in the contract, so the editor's schema removes them (bold and italic survive).

**Limits:** `richTextFeatures` gains `fontFamily`, `fontWeight`, `fontSize` and `textColor`, so a field can allow some or none (the profile bio allows none). `restrictedRichTextSchema` enforces the same on the api.

**Rendering:** `RichTextView` and `ContentRenderer` draw the mark with Text, so `web` and the editor preview stay on one renderer.

## Alternatives considered

- **One font per rich-text block, no per-word styling:** not chosen; clients want to restyle individual words.
- **Per-word sizes in pixels:** not chosen; a pixel size inside a responsive heading doesn't scale with it and ends up too big on phones.
- **TipTap's own font family and colour extensions:** not chosen; they store CSS strings rather than references, so a re-brand or a deleted family couldn't be followed.

## Consequences

- The content document's block schemas and the rich-text mark schema change; stored documents stay valid because every new field is optional, so no `schemaVersion` upgrade is needed unless the build finds otherwise.
- `assetUsage()` and font-family deletion warnings must look inside blocks and rich-text marks ([0111](0111-keep-uploaded-font-families-in-a-library.md)).
- `sameContent()` and the editor's undo history must treat the new attributes like any other.
- The editor's toolbar grows; it must still fit at the editor's 1024px minimum.
