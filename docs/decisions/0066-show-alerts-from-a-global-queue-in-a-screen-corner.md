---
id: "0066"
title: Show alerts from a global queue in a corner of the screen
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, composites, feedback, state, accessibility]
related: ["0048", "0056", "0062", "0065"]
supersedes: []
---

# 0066. Show alerts from a global queue in a corner of the screen

## Context

Apps need to tell users about successes, failures and real-time events (e.g. a friend request arriving), from anywhere in the code, including event handlers outside React. Some messages also belong inline on a page. Like modals ([0065](0065-open-modals-by-id-from-global-state.md)), the queue of alerts is global state, and UI libs can't import the Redux store.

## Decision

- **Two composites:** `Alert`, the visual card, usable inline; and `AlertStack`, which shows alerts in a screen corner using `@radix-ui/react-toast` ([0056](0056-use-radix-primitives-for-interactive-widgets.md)) for timing, pause on hover and focus, swipe to dismiss, the F8 shortcut and announcements.
- **Look:** one `color` (default `primary`): text, border and icon in its 600 step, background in its 100 step. Contrast isn't guaranteed to meet WCAG AA for now. Optional `icon`, `title`, `action`, and an ✕. In the icon's place an alert can show a round `image` (`{ src, alt? }`, plain data, e.g. a sender's avatar) or, in code, any `leading` element; whatever leads and the ✕ are centred on the first line of text.
- **Global queue:** an `alerts` slice in `shared-data-access` holds alert content plus an id and `open` flag. `showAlert(content)` (id generated), `dismissAlert(id)` (animates out), `removeAlert(id)` (called by the stack after the exit). At most 5 open: a 6th dismisses the oldest. `useAlerts()` returns `show()` (returning the id), `dismiss()` and `stackProps` for the app's single AlertStack.
- **Content is plain data:** `message`, `title`, `color`, `icon`, `image`, `action` (`{ label, href }`), `duration` (default 5000ms, `null` to stay), `urgent` (interrupting announcement, default false) and `animation`. Actions are links rather than callbacks so they fit in Redux; the stack's `onNavigate` follows them with the app's router, since the UI library doesn't know about routing.
- **Position:** set on the stack (`bottom-right` by default, or any corner or top/bottom centre). The default animation follows it (e.g. `fadeInRight`/`fadeOutRight` on the right), and each alert can override it. The newest alert is nearest the corner; after an alert leaves, the gap closes smoothly.
- **Layering:** z-index 50, above modals.
- **Stored:** alert content as above, and the stack's `position`.

## Alternatives considered

- **Action callbacks:** not serializable; links with a router hook were chosen.
- **`[color]-500` text on `[color]-200`:** replaced by 600 on 100.
- **Position per alert:** one position per stack was chosen, for predictability.

## Consequences

- When Profiles and an Avatar component exist (0027), an `avatar` field can render generated or uploaded avatars; until then, `image` takes a URL.
- Each app renders one AlertStack at its root (the docs app does; the cms and web apps will when they first raise alerts).
- AlertStack renders its own small stylesheet, since composites can't add to `<UiProvider />`'s.
