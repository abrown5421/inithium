---
id: "0116"
title: Build content pages from a tree of library elements
status: accepted
date: "2026-10-15"
scope: core
tags: [pages, content, cms, editor, elements, plugins, slots]
related: ["0015", "0035", "0036", "0047", "0078", "0091", "0092", "0096", "0097", "0098", "0102", "0105", "0107", "0113", "0115"]
supersedes: ["0093", "0094"]
---

# 0116. Build content pages from a tree of library elements

## Context

Content pages ([0093](0093-build-content-pages-from-sections-columns-and-blocks.md)) and their editor ([0094](0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md)) work, but the page builder feels like a stopgap rather than a tool clients would value:

- **Few, fixed blocks.** It offers eight block types, most of them variations on Container and Text, each with its own small set of fields (`align`, `textColor`, `radius`…). Meanwhile the UI library's components already have serializable, stored prop schemas (`containerPropsSchema`, `textPropsSchema`, …, [0035](0035-define-style-props-as-serializable-zod-schemas.md), [0047](0047-generate-the-style-prop-stylesheet-from-a-property-table.md)) that the builder doesn't use. There are two vocabularies for the same thing.
- **Preset sections.** Layout comes from preset section layouts (halves, thirds…) split into columns. Building something like a row of cards means fighting the presets instead of composing.
- **A daunting editor.** Every tree row carries four action icons, the block palette shows but is disabled until something is selected, and the panels use developer terms (section, column, block).

## Decision

### Structure

- **What a content page is:** still a page drawn by core's reusable `content` template, with a **draft** (autosaved) and a **published** version. Visitors only see the published one.
- **The model:** its content is a **tree of elements**. The page is the root, an implicit vertical column. Each element is a node:

  ```ts
  { id, type, props, children?, label? }
  ```

  - **`props`** is the element's stored props. For library elements that's the component's own stored prop schema plus any content fields (an image's asset id and alt, a button's label and link), validated by the element's contract.
  - **`children`** is only for elements that hold others: Container in this pass.
  - **`label`** is an optional name shown in the editor's Layers tree, e.g. "Pricing card".
  - **Named `slots`** (regions such as a tab's panel or a modal's body) aren't in this pass. The model must allow them to be added later without a new format.
- **Gone:** sections, columns and preset layouts. Layout comes from nesting **Containers**. A row of cards is a row Container holding card Containers, built once and duplicated.
- **Limits:** at most **250 elements** per page and nesting at most **10** deep. Both are enforced by the contract, so the api refuses anything larger.
- **Format version:** content becomes `schemaVersion` 2. `readContentDocument()` upgrades version 1 when reading it (see [Migration](#migration)).

### Elements in this pass

| Element | What it is |
| --- | --- |
| **Container** | Layout (stack or row, gap, alignment, wrapping, a grid of columns), spacing, size, background **colour** (no background images or patterns), text colour, border, radius, shadow, entrance animation, and an anchor id for `#links`. The Add menu offers one plain Container, with no presets. |
| **Text** | Rich text ([0102](0102-edit-rich-text-fields-with-tiptap-and-store-json.md)) with a paragraph-style dropdown: Heading 1–4, Body, Quote. Takes the typography of [0115](0115-style-text-in-the-page-builder-per-part-and-per-word.md) (per element and per word), colour and alignment. Separate Heading, Rich text, Feature and Banner blocks go away. |
| **Image** | An asset by id, as today ([0098](0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)): alt unless decorative, caption, size, radius, optional link. |
| **Icon** | A Lucide icon, its size and colour. |
| **Button** | One Button: label, link, variant, colour, icons. A row of buttons is a Container holding Buttons. |
| **Divider** | Colour, thickness, line style. |

- **Shared by every element:** an entrance animation, and showing or hiding it per device.
- **Spacer is gone:** gap, padding and margin replace it.
- **Later, as their own work:**
  - composites as elements: Modal, PolyBanner, Avatar, Tabs (these bring named slots);
  - components that don't exist yet: Accordion, Video, Carousel.
- **Not planned:** forms. If they come, they'll be a separate CMS forms module whose forms are embedded as an element.
- **Not elements:** core pages. Home, Not Found and the other core pages stay code templates. The builder is for content pages only.

### Plugin elements

- **A slot:** plugins (and `libs/client/`) can add elements through a **content elements** slot ([0015](0015-slot-catalogue.md)). Each plugin decides its own elements while it's being built; core only has to make elements slottable.
- **Three registries:** an element's definition spans three apps' registries.
  - **api: its contract.** The type key `plugin-<name>:<element>`, its props schema, which children it allows, and which props hold asset ids, font family ids or page ids.
  - **web: its renderer.**
  - **cms: its editor entry.** Label, icon, category, defaults and property form.
  - The CMS registry is created for this.
- **Core's own elements** are defined the same way, in core libs. So nothing in core special-cases an element.
- **Inactive or ejected plugins** ([0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)): their elements stay in stored content. The editor shows a "missing element" placeholder that can be deleted, and the site draws nothing in their place. Content holding an unknown element type still validates and saves. Whether unseed removes a plugin's elements is part of [0107](0107-plugin-lifecycle-mechanics.md).

### Responsive editing

- **Device-first in the editor:** the editor previews **Desktop**, **Tablet** and **Phone**. Desktop values apply at every size unless they're overridden at a smaller size. A control shows when it's overridden at the current device and offers a reset.
- **Stored mobile-first:** the editor stores this as the style props' own breakpoint variants. Clients never see breakpoint names.
- **Rows on phones:** a new row Container stacks its children on phones by default.

### Editing

- **Where it lives:** the editor stays at `/pages/:id/content`, filling the space under the CMS's top bar. It needs a window at least 1024px wide. Its preview is an iframe with mirrored stylesheets, drawn by the site's renderer, so a preview always matches the site.
- **Panel-only:** elements are selected on the canvas or in the Layers tree and changed in the properties panel. Rich text is still typed in place. There's no other on-canvas editing (dragging to resize, handles).
- **Copying and moving**, within one page only:
  - **Duplicate** places a deep copy right after the original, children included, with new ids.
  - **Copy** and **Paste** paste into the selected Container, or after the selected element.
  - **Move** by dragging in the Layers tree, or with "Move to…" from the keyboard.
- **Shortcuts:** duplicate, copy, paste, delete, undo, redo, and Esc to select the parent.
- **Saving:** autosave, Publish (`pages.publish`), Discard and session undo/redo work as before.

### The editor's interface

The editor is redesigned so a client with no page-builder experience can use it.

- **Layers (left):** a nested tree with guide lines, collapse arrows and drag handles.
  - Each row shows the element's icon and a readable name: its text, its `label`, or its type.
  - Actions appear only on the hovered or selected row, plus a "⋯" menu (Duplicate, Copy, Paste inside, Move to…, Rename, Delete).
- **Add:** one **"+ Add"** button (in the Layers panel and between elements in the tree) opens a picker of single elements, grouped, each with a one-line description.
  - It inserts inside the selected Container, otherwise after the selected element, otherwise at the end of the page.
  - Nothing is ever shown disabled for want of a selection.
- **Properties (right):**
  - **Groups:** Content, Layout, Style and Advanced, written in plain language.
  - **Context:** a breadcrumb of the selection path (Page › Container › Text) selects any ancestor. A device indicator shows when the current device's values are being edited.
  - **Spacing:** named steps, with a Custom option taking pixels:

    | Step | None | XS | S | M | L | XL | 2XL |
    | --- | --- | --- | --- | --- | --- | --- | --- |
    | px | 0 | 4 | 8 | 16 | 24 | 48 | 96 |

  - **Advanced:** exposes the rest of the element's stored props, except ones that easily break a layout (absolute positioning, overflow).
- **Canvas:** hovering outlines an element with a small name tag. The selected element has a solid outline.
- **Toolbar:** device switches, undo and redo all labelled with tooltips. "Settings" becomes **Page settings**. Publish is the only filled button.
- **Empty page:** a friendly empty state pointing at "+ Add".

### Accessibility warnings

- **What it checks:** an accessibility panel warns about:
  - text whose colour fails AA contrast on its background;
  - skipped heading levels;
  - empty text;
- **Warnings only:** they never block saving or publishing.

### One editor at a time

- **Taking the lock:** opening a page's content editor takes an **edit lock** on that page's content. It records who holds it and since when, and is kept alive by a heartbeat about every 30 seconds.
- **For everyone else:** while the lock is held, other CMS users see who is editing and since when, and can't open that page's content editor.
- **Releasing it:** leaving the editor releases the lock. A lock with no heartbeat for about 2 minutes expires, so a closed or crashed browser can't hold a page forever.
- **No takeover:** a lock that's still alive can't be broken.
- **Enforced by the api:** saving, publishing or discarding a draft without holding the lock is refused (409).
- **Scope:** the lock covers content only. Page settings (the Pages screen's dialog) aren't locked.
- **Permissions:** no new ones. Anyone with `pages.edit` edits, `pages.publish` publishes, and deleting stays on the Pages screen.

### Migration

- **On read:** `readContentDocument()` upgrades version 1 content to version 2.
- **Same look:** the seeded privacy policy ([0097](0097-seed-a-starter-privacy-policy-as-a-content-page.md)), the only content page in use, must look the same after the upgrade.
- **How each part maps:**
  - **Section:** a full-width Container, keeping its background colour, text colour, padding, maximum width, anchor and entrance animation.
  - **Columns:** a row Container whose child Containers keep the columns' width shares and stacking breakpoint.
  - **Heading and rich text blocks:** Text.
  - **Buttons block:** a row Container holding Buttons.
  - **Feature block:** a Container holding an Icon and Text.
  - **Spacer:** an empty Container of its height.
  - **Divider and image blocks:** the matching elements.
- **Patterns:** a section's or banner block's PolyBanner pattern can't be represented until the PolyBanner element exists. It becomes a Container on the pattern's first colour, with the banner's heading and text as Text.

### Asset, font and link usage

- **One generic walk:** usage checks walk the tree using each element's declared references instead of fixed block shapes. These are the asset usage behind deletion warnings, font family usage (`GET /api/fonts/:id/usage`) and page links.
- **New:** deleting a page warns when other content pages link to it.

### Unchanged from 0093 and 0094

- **Page records:** a page's `content` is `{ draft, published }` plus when and by whom each was last saved. `web` receives only the published version.
- **Rich text:** TipTap's JSON, never HTML or Markdown.
- **Links:** stored as a page id or an `https`/`http`/`mailto`/`tel` address.
- **Drawn with the library:** content is drawn with the UI library ([0092](0092-build-ui-from-the-library-before-plain-elements.md)) by the one `ContentRenderer` in `@inithium/shared-content`.
- **Creating pages:** New page, Duplicate and Delete on the Pages screen, and the endpoints and permissions for the draft. A new page starts empty.
- **The site:** client-rendered, and pages are full width by default ([0091](0091-make-pages-full-width-by-default.md)).

### Build order

Each step on its own branch:

1. **Model:** contracts, the element definitions, limits, and the version 2 upgrade with the privacy policy's migration; the renderer.
2. **Editor model and Layers:** the tree, selection, insertion, duplicate, copy/paste, drag and shortcuts.
3. **Properties:** the panels, spacing steps and responsive overrides.
4. **Interface:** the Add picker, toolbar, empty state and canvas outlines.
5. **Edit lock.**
6. **Accessibility warnings,** and usage checks walking the tree.
7. **Plugin elements:** the content elements slot through the api, web and cms registries.

## Alternatives considered

- **Keeping sections and columns, adding a "group" block:** rejected. The preset layouts are what make composing hard.
- **Exposing every style prop to clients by default:** rejected, as too much for clients. A curated panel with an Advanced group was chosen.
- **Free pixel spacing everywhere:** rejected in favour of named steps with a Custom option, to keep pages consistent.
- **Linked components or saved styles:** not chosen. Copying an element or a Container with its children covers the need for now.
- **Starter patterns** (hero, card row…) and Container presets (Row, Grid, Card): not in this pass. Single elements only.
- **Copying between pages:** not in this pass. Copy and paste work within a page.
- **On-canvas editing** (handles, dragging to resize): not in this pass, and maybe never.
- **Background images on Containers:** rejected.
- **Role locking**, where some users may only edit text: rejected. Every CMS user who can edit pages edits them fully.
- **Letting someone take over another person's live edit lock:** not chosen. Locks only expire.
- **Blocking publication on accessibility problems:** rejected. Warnings never block.

## Consequences

- **Format:** stored content moves to `schemaVersion` 2. Every reader goes through `readContentDocument()`.
- **The editor:** `@inithium/cms-content-editor` is largely rewritten: its document service, Layers, properties and Add picker. `ContentRenderer`'s decorators follow elements instead of sections, columns and blocks.
- **New registry:** the CMS gains a registry file. The api and web registries gain content elements, which settles one more slot in [0015](0015-slot-catalogue.md).
- **Page records:** they gain an edit lock. The content endpoints check it, and new endpoints take, keep alive and release it.
- **Future composites:** adding Modal, PolyBanner, Avatar or Tabs as elements will add named slots to the model.
- **Image alt:** the contract still requires alt text unless an image is marked decorative, so it stays a save-blocking rule rather than a warning.
- **The manual:** pages describing content pages and the editor are rewritten as each step lands. Until then they describe what's built today.
