---
title: Content pages
description: Pages clients build in the CMS from sections, columns and blocks, stored as data and drawn by one core template.
scope: core
tags: [pages, content, cms, blocks]
order: 7
decisions: ["0078", "0091", "0092", "0093", "0094"]
---

# Content pages

> **Being built.** This page describes the agreed design ([0093](../decisions/0093-build-content-pages-from-sections-columns-and-blocks.md)). [What exists today](#build-status) is listed at the end.

Pages come in three kinds:

| Kind | Who makes it | How |
| --- | --- | --- |
| Core pages | Core | Code templates: Home, Login, Sign up, Profile, Not Found |
| Plugin pages | Plugins | Code templates for logic-heavy pages, e.g. a shop or a blog |
| **Content pages** | **Clients, in the CMS** | **Blocks, stored on the page record and drawn by core's `content` template** |

Content pages are for low-logic pages such as "About us" or a privacy policy. Anything with real logic belongs in a template.

## Structure

A content page's `content` is a document of **sections**, each split into **columns**, each holding **blocks**:

```
page
└─ section            (background, padding, layout of 1–4 columns, anchor, entrance animation)
   └─ column          (a share of the section's width)
      └─ block        (heading, rich text, buttons, feature, banner, divider, spacer)
```

### Sections

| Setting | Notes |
| --- | --- |
| `layout` | `one`, `halves`, `one-third-two-thirds`, `two-thirds-one-third`, `thirds` or `quarters`. The number of columns must match. |
| `bgColor`, `banner` | A colour, or a PolyBanner pattern drawn over it |
| `textColor` | Inherited by the section's blocks |
| `padding` | `{ y, x }` in px; default 48 and 24 |
| `maxWidth` | The widest the content gets, in px. Leave it out for full width ([0091](../decisions/0091-make-pages-full-width-by-default.md)). |
| `gap` | Between columns, px; default 32 |
| `verticalAlign` | `start` (default), `center`, `end` or `stretch` |
| `stackBelow` | The breakpoint below which columns stack; default `md` |
| `entrance` | An entrance animation |
| `anchor` | An id, so `#anchor` links reach the section |

### Blocks

Every block has an `id`, and can be hidden on phones or on wider screens with `hideOn` (`{ phone?, desktop? }`, split at the section's `stackBelow`).

| Block | `type` | Holds |
| --- | --- | --- |
| Heading | `heading` | `text`, `level` 1–4, `align`, `textColor` |
| Rich text | `rich-text` | A rich text `doc`, `align`, `textColor` |
| Buttons | `buttons` | 1–4 buttons (`label`, `link`, `variant`, `color`, `icon`), `align` |
| Feature | `feature` | `icon`, `title`, `text`, `align` (`start` or `center`), `iconColor` |
| Banner | `banner` | A PolyBanner `pattern`, `height`, optional `heading` and `text`, `align`, `textColor` |
| Divider | `divider` | `color`, `thickness`, `lineStyle` |
| Spacer | `spacer` | `height` in px |

**Image** arrives with assets. Video embed, accordion, tabs, card grid, form and map come later, and plugins will add their own block types through a slot.

### Rich text

Rich text is the editor's (TipTap's) JSON document, limited to:
- **marks:** bold, italic, underline, link;
- **nodes:** paragraph, heading (h2–h4; the page's title is its h1), bulleted and numbered lists (nested), quote and line break.

Anything else is rejected by `richTextDocumentSchema`. It's drawn with Text and Container, never as HTML. `richTextFromPlainText(text)` builds a document of plain paragraphs.

### Links

A link (`contentLinkSchema`) is one of:
- **a page,** `{ type: 'page', pageId }`. It's stored by id, so it survives the page moving. A page that's unpublished or deleted shows as plain text, or as a disabled button. Pages with parameters in their path can't be linked to.
- **an address,** `{ type: 'url', href, newTab? }`. Only `https://`, `http://`, `mailto:` and `tel:` are accepted, so a stored link can never run script.

## Drafts and publishing

`content` on the page record is `{ draft, published }`:
- the CMS edits the draft;
- "Publish" will copy it to `published`, which is all `web` ever receives;
- `published` is `null` until the first publish.

A content page's record `status` (published or unpublished) still decides whether the page is on the site at all.

Stored content carries a `schemaVersion`. `readContentDocument()` upgrades older versions when the API reads them, so changes to the format never break saved pages.

## Rendering

`ContentRenderer` (`@inithium/shared-content`) draws a content document with the UI library's components. `web`'s `content` template uses it, and the CMS editor's preview will too, so the preview always matches the site.

It takes the content and `links` (`{ pagePath(pageId), onNavigate(path), preview? }`), which resolves page links against the site's pages and follows them through the app's router; with `preview`, links and buttons go nowhere. The CMS editor also passes `decorators` (`{ section?, block? }`), which wrap or replace each section and block as it's drawn:

```tsx
import { ContentRenderer } from '@inithium/shared-content';

<ContentRenderer content={page.content} links={{ pagePath: (id) => paths.get(id), onNavigate: navigate }} />
```

Columns sit side by side, sharing the width by their layout's ratios, and stack below the section's breakpoint. Sections pad themselves, so content pages default to the `full-width` layout.

### Example: A content page

A banner, a row of three features and a two-thirds/one-third section with rich text and buttons. The "Prices" button links to a page that isn't on this site, so it's disabled.

```example
architecture/content-pages/sample
```

## Editing

Content pages are edited in the CMS's full-screen editor at `/cms/pages/:id/content` ([0094](../decisions/0094-edit-content-pages-in-a-full-screen-editor.md)). The Pages screen opens it with **Edit content**, and new content pages open straight in it. It needs `pages.edit` and a window at least 1024px wide.

| Part | Does |
| --- | --- |
| Top bar | Back to Pages; the page's title, address and whether it's live (and has unpublished changes); the save status; **Preview width** (desktop, tablet 768px, phone 390px); **Undo** and **Redo**; **Settings** (the page editor); **Discard changes**; **Publish** |
| Structure (left) | The sections, their columns and blocks as a tree. Click to select; move up or down, duplicate or delete each. Problems are marked with a red icon. Below it, **Add a block** (to the selected block's column, after it; or to the selected section's first column) and **Add a section** (with a layout). |
| Preview (middle) | The draft drawn by the site's renderer, in an iframe at the chosen width, so phone and tablet widths really stack the columns. Click a block or section to select it; the selected rich text block becomes editable in place, with the formatting toolbar above the preview. Links go nowhere in the preview. |
| Properties (right) | The selection's settings. A section: layout, background colour or pattern, text colour, spacing, width limit, column alignment and stacking, entrance animation, anchor. A block: its own settings (below), then hiding on phones or wider screens, and which column it's in. |

**Block settings:**
- **Heading:** text, level, alignment and colour.
- **Text:** alignment and colour; the words themselves are edited in the preview.
- **Buttons:** up to four buttons, each with a label, a link (a page, or an address with "open in a new tab"), a style and an icon, plus the row's alignment.
- **Feature:** icon, title, text, alignment and icon colour.
- **Banner:** the pattern (its own editor), height, heading, text, alignment and text colour.
- **Divider:** thickness, line and colour.
- **Spacer:** height.

**Rich text toolbar:**
- bold, italic, underline;
- link (to a page or an address), paragraph, headings 2–4;
- bulleted list, numbered list, quote.

**Saving.** The draft autosaves 1.2 seconds after the last change. A draft with problems (e.g. an empty heading) isn't saved: the field shows its problem, the tree marks the block, and the status says to fix it. Leaving the page with unsaved changes asks first.

**Publishing.**
- **Publish** (`pages.publish`) saves anything pending, copies the draft to the published version and makes the page live if it wasn't. Editors without the permission see it disabled; their draft waits for someone who has it.
- **Discard changes** returns the draft to what's published.
- **Undo and redo** (Ctrl+Z, Ctrl+Shift+Z or Ctrl+Y) cover the session. Quick changes to one field are one step. While typing in a text block, TipTap's own undo applies.

## Build status

1. **Contracts and renderer (built):**
   - the content contracts in `@inithium/shared-contracts`;
   - `content` on page records (the CMS gets both versions, `web` only the published one);
   - `ContentRenderer` in `@inithium/shared-content`;
   - the `content` template in `@inithium/web-pages`.
2. **Creating pages (built):** `pages.create`, `POST /api/pages` and `POST /api/pages/:id/duplicate`, and New page, Duplicate and Delete on the CMS's Pages screen ([Creating pages](../backend/pages.md#creating-pages)).
3. **Editor v1 (built):** `@inithium/cms-content-editor` and the content endpoints ([0094](../decisions/0094-edit-content-pages-in-a-full-screen-editor.md)). Drag-and-drop, revision history and reusable sections come later.
4. **The privacy policy,** seeded at `/privacy-policy` in the secondary footer: protected, with placeholder blocks. Not built.
5. **Assets and the Image block.** Not built.
