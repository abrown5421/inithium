---
id: "0065"
title: Build Modal on Radix Dialog and open modals by id from global Redux state
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, composites, overlays, state, accessibility]
related: ["0030", "0048", "0056", "0062"]
supersedes: []
---

# 0065. Build Modal on Radix Dialog and open modals by id from global Redux state

## Context

Modal is the first composite ([0030](0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md)). Apps need to open modals from anywhere, e.g. an "Invite" button deep in a page opening a modal declared at the app root, so whether a modal is open is global state. The module boundaries forbid UI libs from importing the Redux store, which lives in `@inithium/shared-data-access`.

## Decision

- **A new lib, `@inithium/shared-ui-composites`** (`scope:shared`, `type:ui`, `origin:core`, `ui:composite`), holds composites. Modal is its first member.
- **Modal is controlled and presentational:** `open` and `onOpenChange`, built on `@radix-ui/react-dialog` ([0056](0056-use-radix-primitives-for-interactive-widgets.md)) for the focus trap, Escape, scroll lock, focus return and `aria-modal`.
- **Global state lives in data-access:** a `modals` slice holds `openModalId` (`openModal(id)`, `closeModal(id?)`), registered in `createAppStore()`. One modal is open at a time; opening another replaces it. A `useModal(id)` hook returns `isOpen`, `open()`, `close()` and `modalProps` to spread onto the Modal. Modals can be declared anywhere (usually the app root), since they render in a portal.
- **Look:** a fixed dark overlay (`neutral` 950 at 60%, so it stays dark in dark mode; `overlayColor` changes it) that fades in and out; a centred panel (a Container: `surface-50`, 12px radius, `xl` shadow, 24px padding, 480px maximum width, at most the window's height with internal scrolling) whose entrance and exit are the animation prop (default `fadeInUp` after a 150ms wait, and `fadeOutDown`). The modal stays mounted, with focus trapped, until the exit animation ends.
- **Closing:** overlay click and Escape (both off with `dismissible={false}`), an ✕ button (`closeButton`, default on), or the app setting `open` to false.
- **Title and description:** `title` is required (visible, or screen-reader-only with `hideTitle`); `description` is optional.
- **Layering:** modals at z-index 40, popups at 50, so popups inside a modal appear above it. This extends [0062](0062-draw-select-as-an-input-field-opening-a-list-below.md)'s popup layer into a two-level scale.
- **Container merges slotted `style` and `className`,** so Radix's `asChild` can render onto Containers without replacing their style props.
- **Stored props:** `title`, `description`, `hideTitle`, `dismissible`, `closeButton`, `overlayColor`, `animation` and the panel's style props. Content isn't stored.

## Alternatives considered

- **A single global boolean:** can't say which modal to open; an id was chosen.
- **A Redux-connected `<ModalHost>` in a new feature lib:** more setup for the same result; a hook in data-access was chosen.
- **Stacked modals:** left for later.
- **`surface-950` overlay:** it would turn light in dark mode; a fixed neutral was chosen.

## Consequences

- Apps need the store (`createAppStore()`) to use `useModal`; the web app has none yet. The docs app now creates one for its examples.
- Content inside CMS-built modals will need its own storage decision.
