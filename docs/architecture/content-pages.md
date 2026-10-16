---
title: Content pages
description: Pages clients build in the CMS from a tree of the UI library's elements, stored as data and drawn by one core template.
scope: core
tags: [pages, content, cms, elements]
order: 8
decisions: ["0078", "0091", "0092", "0093", "0094", "0097", "0102", "0116"]
---

# Content pages

> **Being rebuilt** ([0116](../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)). Content is a tree of library elements, built in the page builder. Its remaining steps (the edit lock, accessibility warnings, plugin elements) are listed in the [build status](#build-status).

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

Every element but Container also takes `margin`, `hidden` (e.g. `{ base: true, md: false }` shows it from tablets up) and `animation` (`{ entrance }`). The renderer applies those to a box around the element, so they work the same for components that don't take them, such as rich text. A Divider's box always spans its space (across, or for an upright one, the height of its row), since a line has no size of its own, even inside a Container that centres what it holds.

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

Stored content carries a `schemaVersion`. Read it through `readContentDocument()`, which upgrades older versions, so changes to the format never break saved pages. The api upgrades both versions as it reads a page, so the CMS and `web` only ever see version 2; content stays stored in version 1 until it's next saved or published.

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

It takes the content and `links` (`{ pagePath(pageId), onNavigate(path), preview? }`), which resolves page links against the site's pages and follows them through the app's router; with `preview`, links and buttons go nowhere. Everything it draws carries its element's id as `data-element-id` (and its type as `data-element`), so a host can find an element without wrapping it, which would change the layout. A host can also pass `decorators` (`{ element?, body?, children? }`): `element` wraps or replaces each element as it's drawn (one the site can't draw arrives as `null`); `body` replaces a non-Container element's body inside its box (the builder swaps a selected Text for its in-place editor this way, keeping the box's margin and hiding); and `children` gets each Container's children as drawn (none, when it's empty), e.g. for an empty Container's placeholder:

```tsx
import { readContentDocument } from '@inithium/shared-contracts';
import { ContentRenderer } from '@inithium/shared-content';

const content = readContentDocument(page.content);
<ContentRenderer content={content} links={{ pagePath: (id) => paths.get(id), onNavigate: navigate }} />
```

Containers pad themselves, so content pages default to the `full-width` layout.

### Example: A content page

A hero band, then a row of three cards built once and duplicated: each card is a Container with padding, a radius, a border and a shadow, holding an Icon, a Heading 3, a line of text, a Divider and a Button. The cards stack on phones. The hero's button links to a page that isn't on this site, so it's disabled.

```example
architecture/content-pages/sample
```

## Editing

Content pages are built in the CMS's **page builder** at `/cms/pages/:id/content` ([0116](../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)), which fills the space under the CMS's top bar ([0094](../decisions/0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md)). The Pages screen opens it with **Edit content**, and new content pages open straight in it. It needs `pages.edit` and a window at least 1024px wide. Its toolbar and side panels are `surface-200`, divided by thin borders and shadows ([0096](../decisions/0096-divide-the-content-editors-panels-with-borders.md)), around a `surface-950` canvas.

| Part | Does |
| --- | --- |
| Top bar | Back to Pages; the page's title, address and whether it's live (and has unpublished changes); the save status; **Desktop**, **Tablet** and **Phone** (the one shown is outlined); **Undo** and **Redo**; **Page settings** (the page editor); **Discard changes**; **Publish**, the only filled button. Every icon button has a tooltip. |
| Layers (left) | Every element as a tree, nested as on the page, with guide lines for each level. **Add** opens the Add picker; a new element goes inside the selected Container, otherwise after the selected element, otherwise at the end of the page (the panel says which). Each row: an arrow to collapse a Container, the element's icon and name (its label, else its text, else its type), a red mark for problems, and, on the hovered or selected row, a drag handle, a **+** that adds just after it, and a "⋯" menu. An empty page shows **Add your first element**. |
| Preview (middle) | The draft drawn by the site's renderer in an iframe at the device's width (1280px, 768px or 390px), scaled down to fit when the canvas is narrower, so each device shows its own layout. Click an element to select it; the one under the pointer is outlined dashed and the selected one solid, each with a small tag of its name (inside a Container's top corner; just above anything else, clear of text being typed). Empty Containers show a dashed box, and an empty page says how to start. Click a selected Text to type in it, with the formatting toolbar above the preview. An element from a plugin that isn't installed or is switched off shows a "Missing element" box, which can still be selected and deleted. Links go nowhere in the preview. |
| Properties (right) | Where the selection sits (a trail from the page through its Containers; click one to select it), its name in the Layers, then its properties in tabs (below). |

### The Add picker

**Add** (at the top of the Layers, on an empty page, and as each row's **+**) opens a [Menu](../ui-library/composites/menu.md) that first says where the element goes ("Inside “Card”", "After “Heading”", "At the end of the page"), then lists the elements in groups, each with a line about it:

| Group | Elements |
| --- | --- |
| Layout | Container, Divider |
| Text and media | Text, Image, Icon |
| Actions | Button |

A Container added to a row takes an equal share of it. The groups are `ELEMENT_GROUPS` in `content-tree.service.ts`; plugins' elements will join them with the content elements slot.

### Properties

Each element's properties are in tabs, in plain language, over its component's style props:

| Element | Content | Layout | Style | Advanced |
| --- | --- | --- | --- | --- |
| Container | (none) | Arranged stacked, in a row or in a grid (columns per device); space between; lining up; spreading out; its width in a row, or the columns it spans in a grid; width, widest and shortest sizes; space inside and outside; which devices show it | Background, text colour, border, corners, shadow | What it is (section, article, nav …), anchor, entrance animation, bringing children in one after another, background on hover, height, narrowest and tallest sizes, shadow colour |
| Text | Typed in the preview | Space outside, which devices show it | Alignment, colour, the running text's and the headings' font, weight and size | Entrance animation |
| Image | The image, decorative or its description, caption, link | Where it sits, width, height, shape (aspect ratio) and fitting, space outside, devices | Border, corners, shadow, the caption's colour and type | Entrance animation |
| Icon | The icon, its description | Space outside, devices | Size, colour, space around it, background, border, corners, shadow | Entrance animation |
| Button | Text, link, icons before and after | Width, space outside, devices | Style (filled, outlined, text only, link), colour | Entrance animation |
| Divider | Text in the line and where it sits | Direction, space around the line, space outside, devices | Thickness, line, colour | Entrance animation |

**Spacing** is chosen in named steps, with Custom for any number of pixels (negative for space outside):

| Step | None | XS | S | M | L | XL | 2XL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| px | 0 | 4 | 8 | 16 | 24 | 48 | 96 |

Space inside and outside take one step for every side, or one per side with **Each side its own**.

**Per device.** Desktop, Tablet and Phone in the top bar choose what the preview shows and what the properties edit. A value set on Desktop applies at every size. Set it on Tablet or Phone and that device gets its own value, marked "Tablet only" or "Phone only" under the field, with a link back to the larger size's; a tablet value also applies to phones until they have their own. A new row Container stacks its children on phones, and a new grid has three columns, and one on phones.

**Side by side.** What holds elements decides whether they sit side by side, not their own width: a row of cards is a Container arranged "In a row" holding the cards. Arranging a Container in a row gives each Container inside it an equal share of the row (unless it already has a width in the row), and a Container added to a row does the same, so duplicated cards line up evenly. An element stacked with neighbours shows **Put it side by side with its neighbours** at the top of its Layout tab, which arranges what holds it in a row (`arrangedInRow()`, `property-values.service.ts`). Underneath, the builder stores breakpoint variants mobile first (`device-values.service.ts`): phones are `base`, tablets `md` and desktops `lg`, e.g. `{ base: 8, md: 24 }`; a value set on one device only is a plain value. Hover and other state keys are left alone. Which devices show an element is three switches, stored as `hidden` the same way. Alignment, text and button colours and typography apply to every device.

**Not editable yet:** per-corner radius and per-side borders (a slider sets them all), state values other than a Container's background on hover, gaps split into across and down, and fractions of the space other than halves, thirds and quarters. Values set some other way are kept, and show as the nearest choice.

### Moving, copying and the keyboard

**Each element's ⋯ menu:** Duplicate, Copy, Cut, Paste inside (a Container) or Paste after (anything else), Move up, Move down, **Move to…** (a list of the page and every Container it could go into; it lands at the end), Rename, Delete.

**Moving by dragging:** drag a row onto another. Over the top quarter of a Container (half, for other elements) it goes before it, over the bottom quarter after it, and over the middle inside it, at the end. A line or an outline shows where it'll land; places it can't go (inside itself, or past the page's limits) show nothing. While dragging, a box under the tree moves it to the end of the page.

**Copying** works within the page: Copy or Cut, then Paste puts a copy (with new ids, and without its anchor) where new elements go. Duplicate puts the copy just after the original: build one card, duplicate it twice, and there's a row of cards.

**Keyboard**, in the Layers and the preview (in the properties and the top bar, keys belong to the controls, except undo and redo):

| Keys | Does |
| --- | --- |
| ↑ ↓, Home, End (in the Layers) | Select the row above, below, first or last |
| ← → (in the Layers) | Collapse or expand a Container; ← again goes to its parent, → to its first child |
| Shift+F10 or the menu key (in the Layers) | Open the selected row's ⋯ menu |
| F2, or a double click | Rename (Enter keeps it; empty clears the label; Escape cancels) |
| Ctrl+D, Ctrl+C, Ctrl+X, Ctrl+V | Duplicate, copy, cut, paste |
| Delete or Backspace | Delete (Ctrl+Z brings it back) |
| Alt+↑, Alt+↓ | Move up or down among its siblings |
| Escape | Select the parent |
| Ctrl+Z, Ctrl+Shift+Z or Ctrl+Y | Undo, redo |

Anything that would break the page's limits (250 elements, 10 deep) is refused with an alert. The tree operations are pure functions in `content-tree.service.ts` (`findElement`, `insertElement`, `moveElement`, `copyElement`, `insertionTarget`, `limitProblem`, …), tested on their own.

### Text

**Rich text toolbar** (above the preview, while a Text is being typed in):
- bold, italic, underline;
- **Text style** (`TextStyleDialog`, 0115): the selected words' font, weight (it wins over bold), size (presets relative to the text around them) and colour, each "Same as the text" until chosen, plus **Clear style**. With the cursor inside restyled words it changes those words. Styling pasted from elsewhere is dropped;
- link (to a page or an address), paragraph, headings 1–4;
- bulleted list, numbered list, quote.

**Typography** (in a Text's Style tab, and an image's caption): `TypographyFields`, the font (a FontField with "Default"), the weight (only the weights the font has, from `useFontWeights()`), and **Custom size**, with a size for phones and, optionally, one for wider screens.

### Saving and publishing

- **Autosave:** the draft (version 2) saves 1.2 seconds after the last change. A draft with problems (e.g. a button without text) isn't saved: the field shows its problem, the Layers mark the element, and the status says to fix it. Leaving the page with unsaved changes asks first.
- **Publish** (`pages.publish`) saves anything pending, copies the draft to the published version and makes the page live if it wasn't. Editors without the permission see it disabled; their draft waits for someone who has it.
- **Discard changes** returns the draft to what's published.
- **Undo and redo** cover the session. Quick changes to one field are one step. While typing in a Text, TipTap's own undo applies.

## The privacy policy

Core seeds a **Privacy policy** content page at `/privacy-policy` on first start ([0097](../decisions/0097-seed-a-starter-privacy-policy-as-a-content-page.md)):
- published, in the secondary footer;
- protected: it can't be deleted or moved;
- with starter wording covering what core collects (account details, the public profile, sign-in sessions) and its only cookies (the two essential sign-in cookies, with their real lifetimes).

Admins edit it like any content page. The seed never touches it again, so their changes stay. The wording is a starting point, not legal advice; each site's owner should make it match their site. How seeded content pages work is in [Pages](../backend/pages.md#seeded-content-pages).

## Build status

1. **Contracts and renderer (built):** the content contracts in `@inithium/shared-contracts`; `content` on page records (the CMS gets both versions, `web` only the published one); `ContentRenderer` in `@inithium/shared-content`; the `content` template in `@inithium/web-pages`.
2. **Creating pages (built):** `pages.create`, `POST /api/pages` and `POST /api/pages/:id/duplicate`, and New page, Duplicate and Delete on the CMS's Pages screen ([Creating pages](../backend/pages.md#creating-pages)).
3. **Editor v1 (built, then replaced by the page builder):** the content endpoints ([0094](../decisions/0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md)) remain.
4. **The privacy policy (built):** seeded at `/privacy-policy` in the secondary footer, protected, with starter wording ([above](#the-privacy-policy)).
5. **Assets and the Image block (built):** the [Media library](cms.md#media), the picker and the Image block ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)).
6. **The element tree** ([0116](../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)), in steps:
   1. **Model (built):** the element contracts and limits, version 2 with the upgrade from version 1, and the renderer, which the site uses.
   2. **Editor model and Layers (built):** the tree, selection, insertion, duplicate, copy and paste, drag and shortcuts ([above](#moving-copying-and-the-keyboard)); the [Menu](../ui-library/composites/menu.md) composite.
   3. **Properties (built):** the tabs, spacing steps and per-device values ([above](#properties)); drafts saved as version 2; the builder replaced the version 1 editor at `/cms/pages/:id/content`.
   4. **Interface (built):** the Add picker (grouped, described, saying where), a **+** on each Layers row, the empty page, name tags in the preview, and the toolbar's buttons ([above](#the-add-picker)).
   5. The edit lock.
   6. Accessibility warnings, and usage checks walking the tree.
   7. Plugin elements: the content elements slot through the api, web and cms registries.
