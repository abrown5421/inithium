---
title: AlertStack
description: Shows alerts in a corner of the screen that close by themselves, raised from anywhere in the app through the global alert queue.
scope: core
tags: [ui, composite, feedback, state]
order: 2
decisions: ["0056", "0065", "0066"]
component:
  name: AlertStack
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: ol
---

# AlertStack

AlertStack shows [Alert](alert.md)s in a corner of the screen (bottom-right by default) ([0066](../../decisions/0066-show-alerts-from-a-global-queue-in-a-screen-corner.md)). Each alert slides in (`fadeInRight` on the right), closes by itself after 5 seconds, and slides out (`fadeOutRight`); the alerts below close the gap. The timer pauses while the pointer is over an alert or focus is in one, alerts can be swiped away on touch screens, and F8 jumps to them from the keyboard. Its behaviour comes from [Radix Toast](https://www.radix-ui.com/primitives/docs/components/toast) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)).

Alerts are raised from **anywhere**, including real-time events, through the global alert queue in the app's Redux store, just like [modals](modal.md#opening-modals-from-anywhere).

## Import

```tsx
import { AlertStack } from '@inithium/shared-ui-composites';
import { showAlert, dismissAlert, useAlerts } from '@inithium/shared-data-access';
```

## Showing alerts from anywhere

1. **Place one AlertStack at the app root**, fed by the queue, with the app's router for action links:

   ```tsx
   function AppAlerts() {
     const navigate = useNavigate();
     const { stackProps } = useAlerts();
     return <AlertStack {...stackProps} onNavigate={(href) => navigate(href)} />;
   }

   // Inside <Provider> and the router:
   <AppAlerts />
   ```

2. **Show an alert from any component** with the hook:

   ```tsx
   const { show } = useAlerts();
   show({ color: 'emerald', icon: 'circle-check', title: 'Saved', message: 'Your changes are live.' });
   ```

   **or from anywhere with the store,** e.g. a real-time event handler:

   ```tsx
   socket.on('friend-request', (request) => {
     store.dispatch(
       showAlert({
         icon: 'user-plus',
         title: 'New friend request',
         message: `${request.from} wants to connect.`,
         action: { label: 'View requests', href: '/friends' },
         duration: null,
       }),
     );
   });
   ```

`show()` returns the new alert's id; `dispatch(dismissAlert(id))` (or `useAlerts().dismiss(id)`) closes it early. At most 5 alerts show at once: a 6th closes the oldest.

**An alert's content is plain data,** so it can travel through Redux and be stored: `message`, and optionally `title`, `color`, `icon`, `action` (`{ label, href }`), `duration`, `urgent` and `animation`, as described on [Alert](alert.md) and below.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `duration` | `number \| null` | `5000` | ms before it closes by itself; `null` keeps it until dismissed |
| `urgent` | `boolean` | `false` | Interrupts screen readers, e.g. for failures |
| `action` | `{ label, href }` | none | A link, followed with the stack's `onNavigate` |
| `animation` | `{ entrance?, exit? }` | from the position | Overrides the stack's default animation |

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`alerts`, `onDismiss`, `onRemove`](#alerts-ondismiss-and-onremove) | | **required** | The queue; `useAlerts().stackProps` provides them |
| [`position`](#position) | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | The corner |
| [`onNavigate`](#onnavigate) | `(href: string) => void` | full page load | Follows action links |
| [`label`](#label) | `string` | `'Notifications'` | The region's name |

## Props

#### `alerts`, `onDismiss` and `onRemove`

The alerts (each with an `id` and `open`), what to call when one should close (its time ran out, or it was dismissed or swiped), and what to call to remove one after it has animated out. `useAlerts().stackProps` provides all three from the global queue. You can also manage them with local state, as in the [positions example](#example-positions). **Type:** `StackedAlertItem[]`, `(id: string) => void`, `(id: string) => void`. **Required.**

#### `position`

Which corner or edge alerts appear in. The newest is nearest the corner. The default animation follows it: alerts slide from the right on the right, from the left on the left, down from the top centre and up from the bottom centre; swiping follows the same direction. **Type:** `AlertPosition`. **Default:** `'bottom-right'`.

```tsx
<AlertStack {...stackProps} position="top-center" />
```

#### `onNavigate`

Follows an alert's action link; clicking the action also closes the alert. Pass the app's router so it doesn't reload the page. The UI library doesn't know about the router, so the app supplies this. **Type:** `(href: string) => void`. **Default:** `window.location.assign`.

#### `label`

The region's name for screen readers. **Type:** `string`. **Default:** `'Notifications'`.

## Examples

### Example: Show alerts

Success, failure (urgent), warning and info, through the global queue. They appear bottom-right.

```example
ui-library/alert-stack/show-alerts
```

### Example: Real time, with an action

A simulated friend request arrives after a moment and stays until dismissed; "View requests" navigates with the router.

```example
ui-library/alert-stack/real-time-with-an-action
```

### Example: Positions

A separate stack with local state: pick a position and show alerts there.

```example
ui-library/alert-stack/positions
```

### Example: Animation and duration

A zoom animation with a 10-second timer, and an alert that stays until dismissed.

```example
ui-library/alert-stack/animation-and-duration
```

## Accessibility

- **Announcements:** each alert's text is announced when it appears, politely by default; `urgent: true` interrupts, for failures.
- **Time to read:** the timer pauses while the pointer is over an alert or focus is inside one. Use `duration: null` for anything that needs action.
- **Keyboard:** F8 moves focus to the alerts; Tab reaches each alert's action and ✕; Escape on a focused alert dismisses it.
- **Touch:** swipe an alert towards its edge to dismiss it.
- **Reduced motion:** alerts appear and leave without sliding, and the gap closes instantly.

## Notes

- **Layering:** the stack sits at z-index 50 at the end of the page, above modals (40), so alerts stay visible over an open modal.
- **One stack per app,** at the root. The positions example uses a second, local stack only to demonstrate.
- **Fixed metrics:** 8px between alerts, 16px from the screen's edges, 360px wide (full width minus 32px on small screens).
- **Schemas:** `alertContentSchema` (type `AlertContent`), `alertActionSchema` and `alertStackPropsSchema` in `@inithium/shared-contracts`.
