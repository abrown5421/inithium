---
id: "0094"
title: Edit content pages in a full-screen editor with a framed preview
status: accepted
date: "2026-10-12"
scope: core
tags: [pages, content, cms, editor]
related: ["0086", "0092", "0093"]
supersedes: []
---

# 0094. Edit content pages in a full-screen editor with a framed preview

## Context

[0093](0093-build-content-pages-from-sections-columns-and-blocks.md) set out the content editor: a structure tree, a live preview drawn by the site's renderer, a properties panel, rich text edited in place, device widths, an autosaved draft with Publish and Discard, and undo and redo. Building it settled some details that 0093 left open.

- **Device widths:** the UI library's breakpoints are media queries on the window, so a narrower box inside the CMS window can't trigger them.
- **Field definitions:** the block contracts are Zod schemas whose shapes (colour values, links, patterns) need purpose-built controls rather than ones generated from the schema.

## Decision

**Where it lives**
- **Route:** the editor is the CMS route `/pages/:id/content`, full screen and outside the sidebar frame ([0086](0086-run-the-cms-in-a-sidebar-frame-with-a-pages-screen.md)), in `@inithium/cms-content-editor`.
- **Getting there:** the Pages screen opens it with "Edit content", and a newly created content page opens straight in it.
- **Width:** it needs a window at least 1024px wide; narrower windows get a notice instead.

**Preview**
- **A real frame:** the preview is an iframe the content renders into through a portal, so its breakpoints follow the chosen width: desktop (full), tablet (768px) or phone (390px).
- **Styles:** every stylesheet on the CMS page is mirrored into the frame, including ones added or changed later.
- **Renderer:** it uses the site's `ContentRenderer` in preview mode (links and buttons go nowhere). Decorators outline what's hovered and selected, and swap the selected rich text block for the editor.

**Editing**
- **Properties panel:** built from a field definition per block type, using the UI library's controls (Input, Select, Slider, Switch, ColorPicker, IconPicker, AutoIncrementingList, PolyBanner). The draft is checked against the contracts on every change, and problems are marked on the field and in the tree.
- **Rich text:** edited in place with TipTap inside the frame. The formatting toolbar sits above the preview, outside the frame.
- **Moving things:** sections and blocks move with up and down buttons in the tree, and blocks move between columns from their properties. There's no drag-and-drop in v1.

**Saving and publishing**
- **Autosave:** the draft saves 1.2 seconds after the last change, and only when it's valid. The status shows saved, unsaved, saving, failed or blocked by problems.
- **Publish:** it saves anything pending, copies the draft to the published version, and also makes the page live if it wasn't (both need `pages.publish`).
- **Discard:** it returns the draft to the published version.
- **Undo and redo:** they cover this session. Quick changes to one field merge into a single step, and text being edited keeps TipTap's own undo.

**API**
- `PUT /api/pages/:id/content` saves the draft and `POST /api/pages/:id/content/discard` discards it (both `pages.edit`). `POST /api/pages/:id/content/publish` publishes (`pages.publish`).
- The content records when the draft was saved and when it was published, and by whom.
- JSON bodies may be up to 1 MB, since drafts are saved whole.

## Alternatives considered

None recorded.

## Consequences

- **Plain elements:** the editor needs some, each because no component can do the job ([0092](0092-build-ui-from-the-library-before-plain-elements.md)): the `<iframe>`, TipTap's own markup and stylesheet, and the outline stylesheet. Container has no outline props yet.
- **Shared renderer:** `ContentRenderer` gains `decorators`, and its links gain `preview`. `web` uses neither.
- **Later:** drag-and-drop, revision history and reusable sections.
