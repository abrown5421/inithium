---
title: RichTextView
description: Draws a rich text document - paragraphs, headings, lists, quotes, bold, italic, underline and links - with the UI library, never as HTML.
scope: core
tags: [ui, composite, rich-text, typography]
order: 17
decisions: ["0093", "0102"]
component:
  name: RichTextView
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# RichTextView

RichTextView draws what a [RichTextField](rich-text-field.md) saves ([0102](../../decisions/0102-edit-rich-text-fields-with-tiptap-and-store-json.md)): paragraphs, headings (h1–h4; rich text fields offer h2–h4, content pages may use h1), quotes, bulleted and numbered lists (nested too), and bold, italic, underlined and linked text. It builds everything from [Text](../components/text.md) and [Container](../components/container.md) and never renders HTML from the document, so nothing saved can run on the page.

Page content draws its rich text through it too, with links to the site's pages resolved by the content renderer ([Content pages](../../architecture/content-pages.md)).

## Import

```tsx
import { RichTextView } from '@inithium/shared-ui-composites';
```

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`doc`](#doc) | `RichTextDocument` | required | The document |
| [`align`](#align) | `'start' \| 'center' \| 'end'` | start | Text alignment |
| [`textColor`](#textcolor) | `Colour` | inherited | The text's colour |
| [`gap`](#gap) | `number` | `14` | Space between blocks, px |
| [`resolveLink`](#resolvelink) | `(link) => RichTextResolvedLink` | `resolveUrlLink` | Turns links into addresses |
| [`typography`](#typography) | `ContentTypography` | none | The running text's font, weight and size |
| [`headingTypography`](#headingtypography) | `ContentTypography` | none | The headings' font, weight and size |

## Props

#### `doc`

The rich text document to draw. **Type:** `RichTextDocument`. **Required.**

```tsx
{profile.bio && <RichTextView doc={profile.bio} />}
```

#### `align`

The text's alignment. **Type:** `'start' | 'center' | 'end'`. **Default:** start.

#### `textColor`

The text's colour, as a [colour value](../style-props.md#colour-value). **Type:** `Colour`. **Default:** inherited.

#### `gap`

Space between paragraphs, headings, lists and quotes, in px. **Type:** `number`. **Default:** `14`.

```tsx
<RichTextView doc={bio} gap={8} />
```

#### `resolveLink`

Turns each link into `{ href?, newTab, onClick? }`. A link without an `href` draws as plain text. **Type:** `(link: ContentLink) => RichTextResolvedLink`. **Default:** `resolveUrlLink`, which keeps web addresses and draws links to the site's pages as text, since it can't know their paths. Page content passes its own, which looks pages up and follows them through the router.

```tsx
<RichTextView doc={doc} resolveLink={(link) => (link.type === 'url' ? { href: link.href, newTab: true } : { newTab: false })} />
```

#### `typography`

The running text's font, weight and size ([0115](../../decisions/0115-style-text-in-the-page-builder-per-part-and-per-word.md)): paragraphs, list items and quotes take it, and headings keep the display font and their sizes (see `headingTypography`). `fontSize` is `{ base, md? }` in px. **Type:** `{ fontFamily?, fontWeight?, fontSize? }` (`ContentTypography`).

```tsx
<RichTextView doc={doc} typography={{ fontFamily: 'display', fontWeight: 300, fontSize: { base: 16, md: 18 } }} />
```

#### `headingTypography`

The headings' font, weight and size ([0116](../../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)), for every heading level in the document. Left out, headings use the display font at their level's size (h1 36px, 48px from `md`; h2 26px; h3 21px; h4 18px). A content page's Text element passes it. **Type:** `{ fontFamily?, fontWeight?, fontSize? }` (`ContentTypography`).

```tsx
<RichTextView doc={doc} headingTypography={{ fontFamily: 'body', fontWeight: 600, fontSize: { base: 18 } }} />
```

## Examples

### Example: Basic

Every kind of block and mark.

```example
ui-library/rich-text-view/basic
```

### Example: Field and view

A RichTextField beside the RichTextView of what it saves.

```example
ui-library/rich-text-view/field-and-view
```

## Accessibility

- Headings, lists, quotes and emphasis use their real elements (`h2`, `ul`, `blockquote`, `strong`, `em`), so screen readers announce them.
- List markers are drawn by the component and hidden from screen readers; the list itself is announced.
- Links that open a new tab get `rel="noopener noreferrer"`.

## Notes

- **Restyled words** (the `textStyle` mark, 0115) draw as a Text inside any bold, italic or underline, with `fontFamily`, `fontWeight`, `fontScale` and `textColor`, so a chosen weight wins over bold.
- To check a document before drawing, e.g. to hide an empty bio, use `richTextIsEmpty(doc)`.
