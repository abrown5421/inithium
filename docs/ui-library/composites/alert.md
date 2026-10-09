---
title: Alert
description: A message to the user, such as a success, failure, warning or notice, in one colour with an icon, title, link and ✕, placed inline or shown by an AlertStack.
scope: core
tags: [ui, composite, feedback]
order: 1
decisions: ["0048", "0050", "0066"]
component:
  name: Alert
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# Alert

Alert tells the user something: that a save worked or failed, that storage is nearly full, that a friend request arrived ([0066](../../decisions/0066-show-alerts-from-a-global-queue-in-a-screen-corner.md)). It's a card with an optional icon and title, the message, an optional link, and an ✕, all in one colour: text, border and icon in the colour's 600 step on its 100 step.

Use Alert directly to put a message **inline** on a page, e.g. above a form. To show alerts **in a corner of the screen** that close by themselves, raised from anywhere in the app, use an [AlertStack](alert-stack.md) with the global alert queue.

There are no status colours, so pick a colour per kind. The convention: `emerald` for success, `red` for failure, `amber` for warnings, `sky` for information.

## Import

```tsx
import { Alert } from '@inithium/shared-ui-composites';
```

## Props at a glance

`message` is required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`message`](#message-and-title) | `ReactNode` | **required** | The text |
| [`title`](#message-and-title) | `ReactNode` | none | A bold line above it |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | The alert's colour |
| [`icon`](#icon) | `IconName` | none | Lucide icon before the text |
| [`action`](#action) | `{ label, href?, onClick? }` | none | A link under the message |
| [`onDismiss`](#ondismiss) | `() => void` | none | Shows an ✕ that calls it |
| [`role`](#role) | `'status' \| 'alert'` | none | Announce an inline alert |
| [`margin`](#margin) | `Variants<Sides>` | none | Space around it, px |
| [`animation`, `show`, `replay`, `onEntranceEnd`, `onExitEnd`](#animation) | | | Animation |

## Props

#### `message` and `title`

The text, and an optional bold line above it. **Type:** `ReactNode`. **Required:** `message`.

```tsx
<Alert title="Saved" message="Your changes are live." />
```

#### `color`

A [colour value](../style-props.md#colour-value) whose name sets the alert's look: text, border and icon in its 600 step, background in its 100 step, whatever intensity you pass. **Type:** `Colour`, except `'transparent'`. **Default:** `'primary'`.

```tsx
<Alert color="emerald" message="Saved." />
<Alert color="red" message="Couldn't save." />
```

#### `icon`

A [Lucide icon](../components/icon.md#name) at 20px before the text, in the alert's colour. **Type:** `IconName`.

```tsx
<Alert color="amber" icon="triangle-alert" message="Storage almost full." />
```

#### `action`

A link-style button under the message. `onClick` runs when it's clicked; with only an `href`, it does a full page load there. (In an [AlertStack](alert-stack.md#onnavigate), action links go through the app's router instead.) **Type:** `{ label: string; href?: string; onClick?: () => void }`.

```tsx
<Alert message="Your trial ends tomorrow." action={{ label: 'Choose a plan', href: '/billing' }} />
```

#### `onDismiss`

Shows an ✕ button (labelled "Dismiss") that calls this. Without it, the alert has no ✕. **Type:** `() => void`.

#### `role`

For an alert that appears inline while the page is open, so screen readers announce it: `status` waits until they finish speaking, `alert` interrupts (for failures). Leave it unset for alerts that are there when the page loads. Alerts in an AlertStack are announced for you. **Type:** `'status' | 'alert'`.

#### `margin`

[Sides](../style-props.md#sides) in px. **Type:** `Variants<Sides>`.

#### `animation`

The [animation prop](../animations/index.md), with `show` to animate an inline alert out. **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<Alert show={visible} animation={{ entrance: { name: 'fadeIn' }, exit: { name: 'fadeOut' } }} … />
```

## Examples

### Example: Kinds of alert

Success, failure, warning and information, by colour and icon.

```example
ui-library/alert/kinds-of-alert
```

### Example: Inline and dismissible

An inline alert with an action and an ✕ that animates it out.

```example
ui-library/alert/inline-dismissible
```

### Example: Colours

Any colour works.

```example
ui-library/alert/colours
```

## Accessibility

- **The ✕** is a button labelled "Dismiss".
- **Inline alerts that appear later** need `role` to be announced; alerts in an AlertStack are announced by it.
- **Contrast:** the 600 step on the 100 step is readable for most colours but isn't guaranteed to meet WCAG AA; check light colours such as `yellow`.
- **Don't rely on colour alone:** an icon and title make the kind of alert clear.

## Notes

- **Fixed metrics:** at most 360px wide (the width of its container below that), 12px padding, a 2px border, an 8px radius, a large shadow, 14px text and a 20px icon.
- **Schema:** an alert's content is `alertContentSchema` (type `AlertContent`) in `@inithium/shared-contracts`.
