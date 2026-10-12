---
title: Content pages
description: Pages clients build in the CMS from sections, columns and blocks, stored as data and drawn by one core template.
scope: core
tags: [pages, content, cms, blocks]
order: 7
decisions: ["0078", "0091", "0092", "0093"]
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

It takes the content and `links` (`{ pagePath(pageId), onNavigate(path) }`), which resolves page links against the site's pages and follows them through the app's router:

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

## Editing (planned)

- **The editor:** a full-screen CMS editor with three parts:
  - a structure tree and "add block" panel on the left;
  - the live preview in the middle, with desktop, tablet and phone widths;
  - a properties panel on the right, generated from the selected block's schema.
- **Text** is edited in place with TipTap.
- **Drafts** autosave; undo and redo work within a session.
- **New page** asks for a title, a path, the template (Content page) and a layout. Pages can be duplicated.
- **Permissions:** `pages.create` for owner, admin and editor; `pages.publish` stays with owner and admin, so editors build drafts that someone else publishes.

## Build status

1. **Contracts and renderer (built):**
   - the content contracts in `@inithium/shared-contracts`;
   - `content` on page records (the CMS gets both versions, `web` only the published one);
   - `ContentRenderer` in `@inithium/shared-content`;
   - the `content` template in `@inithium/web-pages`.
2. **Creating pages:** `POST /api/pages` and "New page". Not built.
3. **Editor v1.** Not built.
4. **The privacy policy,** seeded at `/privacy-policy` in the secondary footer: protected, with placeholder blocks. Not built.
5. **Assets and the Image block.** Not built.
