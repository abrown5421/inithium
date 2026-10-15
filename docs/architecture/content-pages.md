---
title: Content pages
description: Pages clients build in the CMS from a tree of the UI library's elements, stored as data and drawn by one core template.
scope: core
tags: [pages, content, cms, elements]
order: 8
decisions: ["0078", "0091", "0092", "0093", "0094", "0097", "0102", "0116"]
---

# Content pages

> **Being rebuilt** ([0116](../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)). Content is now a tree of library elements, and the site draws it. The editor is being rebuilt in steps: until it edits the new format, it still edits and saves drafts in version 1 (sections, columns and blocks), which the site upgrades as it reads them. [What exists today](#build-status) is listed at the end.

Pages come in three kinds:

| Kind | Who makes it | How |
| --- | --- | --- |
| Core pages | Core | Code templates: Home, Login, Sign up, Profile, Not Found |
| Plugin pages | Plugins | Code templates for logic-heavy pages, e.g. a shop or a blog |
| **Content pages** | **Clients, in the CMS** | **Elements, stored on the page record and drawn by core's `content` template** |

Content pages are for low-logic pages such as "About us" or a privacy policy. Anything with real logic belongs in a template.

## Structure

A content page's content (`contentDocumentSchema`, `schemaVersion` 2) is a list of **elements**. The page itself is the root, a vertical column the elements stack down. Each element is:

```ts
{ id, type, props, children?, label? }
```

- `id`: unique within the page (`contentIdSchema`; `createContentId()` makes one).
- `type`: `container`, `text`, `image`, `icon`, `button` or `divider` (`contentElementTypes`), or a plugin's (below).
- `props`: the element's stored props. For a library element these are its component's own stored props, style props with their breakpoint and state variants included, plus its content.
- `children`: only Containers hold other elements.
- `label`: an optional name for the editor's Layers, e.g. "Pricing card".

Layout comes from nesting Containers. A row of three cards is a row Container holding three card Containers, each holding the card's elements:

```
page
├─ container            (as: section, padding, a background colour)
│  ├─ text              (a Heading 1)
│  └─ button
└─ container            (flex: column on phones, row from md)
   ├─ container         (a card: padding, radius, border, shadow)
   │  ├─ icon
   │  ├─ text
   │  └─ button
   ├─ container         (the same card, duplicated)
   └─ container
```

### Elements

| Element | `type` | Props |
| --- | --- | --- |
| Container | `container` | Container's style props except `position` and `overflow` (they break layouts too easily): layout (`flex`, `grid`, `flexItem`, `gridItem`), spacing, sizing, `bgColor` (a colour; no images or patterns), `textColor`, borders, `radius`, `shadow`, `as`, `hidden`; plus `animation` (`{ entrance }`), `stagger` and `anchor` (an id for `#anchor` links) |
| Text | `text` | A rich text `doc` (headings 1–4, paragraphs, lists, quotes), `align`, `textColor`, `typography` (the running text) and `headingTypography` (its headings) |
| Image | `image` | `assetId`, `alt` (required unless `decorative`), `caption`, `captionColor`, `captionTypography`, `align`, optional `link`, and Image's style props (`width` defaults to the space it's in, `height`, `radius`, borders, `shadow`), `fit`, `aspectRatio` |
| Icon | `icon` | `name`, optional `label` (otherwise decorative), and Icon's style props (`size`, `strokeWidth`, colours, padding, radius, borders, shadow) |
| Button | `button` | `label`, `link`, `leadingIcon`, `trailingIcon` (default: an external-link icon when the link opens a new tab), and Button's style props (`variant`, `color`, colour overrides, width, padding) |
| Divider | `divider` | `color`, `thickness` (1–8), `lineStyle`, `orientation`, padding, optional `label` and `labelAlign` (decorative unless labelled) |

Every element but Container also takes `margin`, `hidden` (e.g. `{ base: true, md: false }` shows it from tablets up) and `animation` (`{ entrance }`). The renderer applies those to a box around the element, so they work the same for components that don't take them, such as rich text.

**Typography** ([0115](../decisions/0115-style-text-in-the-page-builder-per-part-and-per-word.md)): each `…typography` is an optional `contentTypographySchema` object, `{ fontFamily?, fontWeight?, fontSize?: { base, md? } }`. The font is a role or a library family (`{ familyId }`), the weight 100–900, and the size is in px (8–160), with `md` from the medium breakpoint up. Left out, each part keeps its default look. A Text's `typography` styles its running text and `headingTypography` its headings, which otherwise use the display font at their level's size. Buttons have no typography: they keep Button's fixed size ([0054](../decisions/0054-style-buttons-by-variant-from-one-colour.md)).

**Limits:** at most `MAX_CONTENT_ELEMENTS` (250) elements on a page, nested ones included, and at most `MAX_CONTENT_DEPTH` (10) deep. They're checked before the elements are parsed, along with every id being unique. Problems point at the field, e.g. `elements.0.children.2.props.label`, because each element is checked against its own type's contract only.

**Plugin elements:** a plugin's element has the type `plugin-<name>:<element>`, e.g. `plugin-ecom:product-grid`. Core keeps any props it has, and its `children` if it holds some, so content still saves while the plugin is inactive or after it's ejected. On the site, an element no installed plugin draws draws nothing; plugins will draw theirs through the content elements slot ([0015](../decisions/0015-slot-catalogue.md)), which isn't built yet.

Accordion, video, carousel, Modal, PolyBanner, Avatar and Tabs elements come later. Forms aren't planned.

### Rich text

Rich text is the editor's (TipTap's) JSON document, limited to:
- **marks:** bold, italic, underline, link, and `textStyle` for restyled words (below);
- **nodes:** paragraph, heading (h1–h4; rich text fields offer h2–h4, and a content page's Text may hold its title as h1), bulleted and numbered lists (nested), quote and line break.

**Restyled words** ([0115](../decisions/0115-style-text-in-the-page-builder-per-part-and-per-word.md)): the `textStyle` mark, `{ family?, weight?, size?, color? }` with at least one. `family` is a role or `{ familyId }`, `weight` 100–900 (it wins over bold), `size` a ratio of the surrounding text (0.5–3; the editor offers `richTextSizePresets`), and `color` a colour value. Each attribute is its own feature (`fontFamily`, `fontWeight`, `fontSize`, `textColor`) for `restrictedRichTextSchema`, so a field can allow some or none; the profile bio allows none. RichTextView draws the size with Text's `fontScale`.

Anything else is rejected by `richTextDocumentSchema`. It's drawn by [RichTextView](../ui-library/composites/rich-text-view.md) (content's `RichText` adds page links), never as HTML. `richTextFromPlainText(text)` builds a document of plain paragraphs.

The same document is what [RichTextField](../ui-library/composites/rich-text-field.md) saves everywhere else (bios, and later blog posts or product descriptions), with each field allowing only some of it ([0102](../decisions/0102-edit-rich-text-fields-with-tiptap-and-store-json.md)). The converters between it and TipTap's own JSON, `richTextToTiptap()` and `tiptapToRichText()`, live in `@inithium/shared-ui-composites` and are shared by the page editor and the field.

### Links

A link (`contentLinkSchema`) is one of:
- **a page,** `{ type: 'page', pageId }`. It's stored by id, so it survives the page moving. A page that's unpublished or deleted shows as plain text, or as a disabled button. Pages with parameters in their path can't be linked to.
- **an address,** `{ type: 'url', href, newTab? }`. Only `https://`, `http://`, `mailto:` and `tel:` are accepted, so a stored link can never run script.

## Drafts and publishing

`content` on the page record is `{ draft, published }`:
- the CMS edits the draft;
- "Publish" copies it to `published`, which is all `web` ever receives;
- `published` is `null` until the first publish.

A content page's record `status` (published or unpublished) still decides whether the page is on the site at all.

Stored content carries a `schemaVersion`. Read it through `readContentDocument()`, which upgrades older versions, so changes to the format never break saved pages. Until the editor edits version 2, drafts are still saved as version 1 (`pageContentSchema`, `readContentDocumentV1()`), and `web` upgrades the published version as it draws it.

### Version 1 and its upgrade

Version 1 ([0093](../decisions/0093-build-content-pages-from-sections-columns-and-blocks.md)) held sections (a layout of 1–4 columns, background, padding, width limit, anchor, entrance), each column holding blocks (heading, rich text, buttons, feature, banner, divider, spacer, image). Its contracts stay (`contentDocumentV1Schema`, the block schemas) so stored version 1 content can always be read. `upgradeContentV1()` turns it into elements drawing the same page:

| Version 1 | Version 2 |
| --- | --- |
| A section | A full-width Container (`as: section`) with its padding, background, text colour, anchor and entrance. One column without a width limit holds its elements directly; otherwise a row Container holds a Container per column, sharing the width as the layout did and stacking below the section's breakpoint. |
| Heading, rich text | Text. A heading block keeps its size in `headingTypography`; rich text starting with a heading gets 8px above it (rich text used to draw that space itself). |
| Buttons | A row Container holding Buttons |
| Feature | A Container holding an Icon and two Texts |
| Spacer | An empty Container of its height |
| Image, divider | Image, Divider |
| Banner, a section's pattern | A Container on the pattern's first colour (with the banner's heading and text), until the PolyBanner element exists |
| `hideOn` | `hidden` at the section's breakpoint |

Ids are kept, and new elements get ids made from their source's (e.g. `<section id>-row`), so upgrading the same content always gives the same result. The seeded privacy policy upgrades to one band holding its title, introduction, a rule and the policy, and looks as it did.

## Rendering

`ContentRenderer` (`@inithium/shared-content`) draws a content document's elements with the UI library's components. `web`'s `content` template uses it, and the rebuilt editor's preview will too, so the preview always matches the site.

It takes the content and `links` (`{ pagePath(pageId), onNavigate(path), preview? }`), which resolves page links against the site's pages and follows them through the app's router; with `preview`, links and buttons go nowhere. A host can pass `decorators` (`{ element?, children? }`): `element` wraps or replaces each element as it's drawn (one the site can't draw arrives as `null`), and `children` gets each Container's children as drawn (none, when it's empty), e.g. for an empty Container's placeholder:

```tsx
import { readContentDocument } from '@inithium/shared-contracts';
import { ContentRenderer } from '@inithium/shared-content';

const content = readContentDocument(page.content);
<ContentRenderer content={content} links={{ pagePath: (id) => paths.get(id), onNavigate: navigate }} />
```

Containers pad themselves, so content pages default to the `full-width` layout. The editor's preview still draws version 1 with `ContentRendererV1` until the editor is rebuilt.

### Example: A content page

A hero band, then a row of three cards built once and duplicated: each card is a Container with padding, a radius, a border and a shadow, holding an Icon, a Heading 3, a line of text, a Divider and a Button. The cards stack on phones. The hero's button links to a page that isn't on this site, so it's disabled.

```example
architecture/content-pages/sample
```

## Editing

> This is the version 1 editor, which edits sections, columns and blocks. It's being replaced ([0116](../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)).

Content pages are edited in the CMS's page editor at `/cms/pages/:id/content`, which fills the space under the CMS's top bar, with its own toolbar first ([0094](../decisions/0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md)). The Pages screen opens it with **Edit content**, and new content pages open straight in it. It needs `pages.edit` and a window at least 1024px wide. Its toolbar and side panels are `surface-200`, divided by thin borders and shadows ([0096](../decisions/0096-divide-the-content-editors-panels-with-borders.md)), around a `surface-950` canvas, the same backdrop pages animate over on the site.

| Part | Does |
| --- | --- |
| Top bar | Back to Pages (the arrow button); the page's title, address and whether it's live (and has unpublished changes); the save status; **Preview width** (desktop, tablet 768px, phone 390px); **Undo** and **Redo**; **Settings** (the page editor); **Discard changes**; **Publish** |
| Structure (left) | The sections, their columns (a row each, with how many blocks they hold, in multi-column sections) and blocks as a tree. Click to select; move up or down, duplicate or delete sections and blocks. Problems are marked with a red icon. Below it, **Add a block** goes into the selected column, or after the selected block, or into a one-column section (a section of several columns asks you to pick a column first), and **Add a section** takes a layout. |
| Preview (middle) | The draft drawn by the site's renderer, in an iframe at the chosen width, so phone and tablet widths really stack the columns. Click a block, column or section to select it; empty columns show a dashed box to click; the selected rich text block becomes editable in place, with the formatting toolbar above the preview. Links go nowhere in the preview. |
| Properties (right) | The selection's settings. A section: layout, background colour or pattern, text colour, spacing, width limit, column alignment and stacking, entrance animation, anchor. A block: its own settings (below), then hiding on phones or wider screens, and which column it's in. |

**Block settings:**
- **Heading:** text, level, alignment and colour.
- **Text:** alignment and colour; the words themselves are edited in the preview.
- **Buttons:** up to four buttons, each with a label, a link (a page, or an address with "open in a new tab"), a style and an icon, plus the row's alignment.
- **Feature:** icon, title, text, alignment and icon colour.
- **Banner:** the pattern (its own editor), height, heading, text, alignment and text colour.
- **Divider:** thickness, line and colour.
- **Spacer:** height.

**Text style** (in the Properties panel of headings, rich text, features, banners and image captions): each text part's colour, then `TypographyFields`. These are the font (a FontField with "Default"), the weight (only the weights the font has, from `useFontWeights()`), and **Custom size**, with a size for phones and, optionally, one for wider screens. A rich text block's fields style its running text.

**Rich text toolbar:**
- bold, italic, underline;
- **Text style** (`TextStyleDialog`, 0115): the selected words' font, weight (it wins over bold), size (presets relative to the text around them) and colour, each "Same as the text" until chosen, plus **Clear style**. With the cursor inside restyled words it changes those words. Styling pasted from elsewhere is dropped;
- link (to a page or an address), paragraph, headings 2–4;
- bulleted list, numbered list, quote.

**Saving.** The draft autosaves 1.2 seconds after the last change. A draft with problems (e.g. an empty heading) isn't saved: the field shows its problem, the tree marks the block, and the status says to fix it. Leaving the page with unsaved changes asks first.

**Publishing.**
- **Publish** (`pages.publish`) saves anything pending, copies the draft to the published version and makes the page live if it wasn't. Editors without the permission see it disabled; their draft waits for someone who has it.
- **Discard changes** returns the draft to what's published.
- **Undo and redo** (Ctrl+Z, Ctrl+Shift+Z or Ctrl+Y) cover the session. Quick changes to one field are one step. While typing in a text block, TipTap's own undo applies.

## The privacy policy

Core seeds a **Privacy policy** content page at `/privacy-policy` on first start ([0097](../decisions/0097-seed-a-starter-privacy-policy-as-a-content-page.md)):
- published, in the secondary footer;
- protected: it can't be deleted or moved;
- with starter wording covering what core collects (account details, the public profile, sign-in sessions) and its only cookies (the two essential sign-in cookies, with their real lifetimes).

Admins edit it like any content page. The seed never touches it again, so their changes stay. The wording is a starting point, not legal advice; each site's owner should make it match their site. How seeded content pages work is in [Pages](../backend/pages.md#seeded-content-pages).

## Build status

1. **Contracts and renderer (built):** the content contracts in `@inithium/shared-contracts`; `content` on page records (the CMS gets both versions, `web` only the published one); `ContentRenderer` in `@inithium/shared-content`; the `content` template in `@inithium/web-pages`.
2. **Creating pages (built):** `pages.create`, `POST /api/pages` and `POST /api/pages/:id/duplicate`, and New page, Duplicate and Delete on the CMS's Pages screen ([Creating pages](../backend/pages.md#creating-pages)).
3. **Editor v1 (built, being replaced):** `@inithium/cms-content-editor` and the content endpoints ([0094](../decisions/0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md)).
4. **The privacy policy (built):** seeded at `/privacy-policy` in the secondary footer, protected, with starter wording ([above](#the-privacy-policy)).
5. **Assets and the Image block (built):** the [Media library](cms.md#media), the picker and the Image block ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)).
6. **The element tree** ([0116](../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)), in steps:
   1. **Model (built):** the element contracts and limits, version 2 with the upgrade from version 1, and the renderer, which the site uses.
   2. Editor model and Layers: the tree, selection, insertion, duplicate, copy and paste, drag and shortcuts.
   3. Properties: the panels, spacing steps and responsive overrides. Drafts are saved as version 2 from here.
   4. Interface: the Add picker, toolbar, empty state and canvas outlines.
   5. The edit lock.
   6. Accessibility warnings, and usage checks walking the tree.
   7. Plugin elements: the content elements slot through the api, web and cms registries.
