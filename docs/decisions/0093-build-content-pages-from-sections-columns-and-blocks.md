---
id: "0093"
title: Build content pages from sections, columns and blocks
status: accepted
date: "2026-10-12"
scope: core
tags: [pages, content, cms, blocks, rich-text, assets]
related: ["0015", "0024", "0028", "0029", "0045", "0078", "0079", "0080", "0091", "0092"]
supersedes: []
---

# 0093. Build content pages from sections, columns and blocks

## Context

Pages are records drawn by code templates ([0078](0078-store-pages-as-records-rendered-by-code-templates.md)). Core ships its own code pages (Home, Login, Sign up, Profile) and plugins will ship logic-heavy ones (e.g. a shop or a blog). Clients also need to build simple, low-logic pages themselves in the CMS, such as an "About us" or a privacy policy. Those must be stored as data and drawn for them, never written as code.

## Decision

**Structure**

- A **content page** is a page whose template is core's reusable `content` template. Its blocks are stored on the page record.
- Its content is a list of **sections**. Each section has a **layout** of 1–4 **columns** (`one`, `halves`, `one-third-two-thirds`, `two-thirds-one-third`, `thirds`, `quarters`), and each column holds **blocks**. Blocks don't nest; a "group" block may come later.
- **Section settings:** background colour or a PolyBanner pattern, text colour, padding, an optional maximum content width (full width by default, [0091](0091-make-pages-full-width-by-default.md)), the gap between columns, vertical alignment, an entrance animation and an anchor id (for `#links`).
- **Columns stack** below the section's `stackBelow` breakpoint (default `md`). Each block can be hidden on phones or on wider screens; nothing finer.

**Blocks**

- **v1:** Heading, Rich text, Buttons (1–4), Divider, Spacer, Feature (icon, title and text) and Banner (a PolyBanner with an optional heading and text).
- **Image** arrives with assets.
- **Later:** video embed, accordion (FAQ), tabs, card grid, form and map.
- **Styling:** each block exposes a curated set of style options, not the whole style-prop surface. Colours are theme references, so a re-brand follows.
- **Plugin blocks:** plugins will be able to add block types through a "content blocks" slot ([0015](0015-slot-catalogue.md)), built when the first plugin needs it.
- **Contracts and safety:** every shape is a Zod contract in `@inithium/shared-contracts`, and everything is drawn with the UI library's components ([0092](0092-build-ui-from-the-library-before-plain-elements.md)), never as HTML.

**Rich text and links**

- **Editor:** TipTap.
- **Storage:** its JSON document, limited to these marks and nodes; anything else is rejected:
  - marks: bold, italic, underline and link;
  - nodes: paragraphs, h2–h4, bulleted and numbered lists, quotes and line breaks.
- **Links** go either to a page, stored by its id so they survive the page moving, or to an external address (`https://`, `mailto:` or `tel:` only) with an optional new tab.

**Editing**

- **The editor:** a full-screen CMS editor with three parts:
  - a structure tree and "add block" panel;
  - a live preview drawn by the same renderer `web` uses;
  - a properties panel generated from the selected block's schema.
  - Text is edited in place in the preview.
- **Previews:** desktop, tablet and phone widths.
- **Drafts:** each content page has a **draft** (autosaved) and a **published** version; visitors only ever see the published one. "Publish" copies the draft live, and "Discard changes" goes back to it.
- **Undo and redo:** within a session only.
- **Later:** revision history and reusable sections. `updatedAt` and `updatedBy` are kept.

**Pages, permissions and the privacy policy**

- **New page:** asks for a title, a path (suggested from the title, unique, with no parameters), the template (Content page, the only reusable one) and a layout (`full-width` by default, `default` or `bare`). It starts as an unpublished draft with one empty section. Pages can be duplicated.
- **Permissions:** a new `pages.create` permission for owner, admin and editor. `pages.publish` stays with owner and admin, so editors build drafts but don't publish.
- **Privacy policy:** core seeds one at `/privacy-policy`, in the secondary footer. Its placeholder sections say clearly that they must be replaced. It can't be deleted, but its blocks are fully editable.

**Images, delivery and versioning**

- **Images in two phases:** content pages ship first without the Image block. Assets ([0028](0028-store-assets-behind-pluggable-storage-drivers.md)) follow, and the Image block comes with them.
- **Image limits:** core content images may use the MongoDB driver (2 MB each); only avatar and banner uploads require a scalable driver.
- **Alt text:** Image blocks require it unless they're marked decorative.
- **SEO:** `web` stays a client-rendered app for now. Pages set their title and description, and an `og:image` will follow; pre-rendering is a later, separate decision.
- **Versioning:** stored content carries a `schemaVersion`, and the API upgrades older content when it reads it (`readContentDocument`).

**Build order**, each step on its own branch:

1. contracts and the renderer;
2. the create endpoint and "New page";
3. the editor v1;
4. seeding the privacy policy;
5. assets and the Image block.

## Alternatives considered

- **Freely nested blocks:** more flexible, but harder to edit and easier to break. Rejected for v1.
- **Markdown for rich text:** simpler to store, but weaker for links to pages and future marks. Rejected.
- **Lexical as the editor:** not chosen.
- **Assets before content pages:** would delay pages clients can already use without images.
- **Exposing every style prop on blocks:** too much for clients; a curated set was chosen.

## Consequences

- Text gains `fontStyle` and `textDecoration` style props, and `strong` and `em` elements; Container gains `blockquote`. These extend the fixed lists of [0045](0045-constrained-as-prop-for-semantic-elements.md) and are needed to draw rich text with components.
- Page records gain an optional `content` (`{ draft, published }`). `web` receives only the published version, inside the site bundle.
- `@inithium/shared-content` holds the renderer, so `web` and the CMS preview always draw the same thing.
- Content inside a plugin's own pages, and plugin uploads (0029), are unaffected.
