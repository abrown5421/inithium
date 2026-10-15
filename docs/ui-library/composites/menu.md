---
title: Menu
description: A list of actions that opens from a button, with icons, shortcut hints, separators and a danger colour.
scope: core
tags: [ui, composite, menu, actions]
order: 19
decisions: ["0056", "0117"]
component:
  name: Menu
  layer: composite
  import: '@inithium/shared-ui-composites'
---

# Menu

Menu opens a list of actions from a button ([0117](../../decisions/0117-open-lists-of-actions-from-a-menu-composite.md)), e.g. a row's "⋯" button. Its behaviour comes from [Radix Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)): it opens by click or keyboard, moves with the arrow keys and closes with Escape. To choose a value, use [Select](../components/select.md) instead; for links in the site's navigation, [Navbar](navbar.md).

## Import

```tsx
import { Menu, type MenuItem } from '@inithium/shared-ui-composites';
```

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`items`](#items) | `MenuItem[]` | required | The rows, top to bottom |
| [`children`](#children) | `ReactElement` | required | The button that opens it |
| [`side`](#side) | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Which side of the button it opens on |
| [`align`](#align) | `'start' \| 'center' \| 'end'` | `'start'` | How it lines up with the button |
| [`aria-label`](#aria-label) | `string` | none | Names the menu for screen readers |
| [`open`](#open-and-onopenchange) | `boolean` | uncontrolled | Whether it's open |
| [`onOpenChange`](#open-and-onopenchange) | `(open: boolean) => void` | none | Called when it opens or closes |

## Props

#### `items`

The rows. Each is an action, `{ label, onSelect, icon?, shortcut?, disabled?, danger? }`, or `'separator'` for a thin line between groups. **Type:** `MenuItem[]`. **Required.**

- `icon`: a Lucide icon name, drawn at 16px before the label.
- `shortcut`: a hint at the row's end, e.g. `'Ctrl+D'`. It only describes the shortcut: handle the keys yourself.
- `disabled`: shown faded and skipped by the keyboard.
- `danger`: the row in red, for actions that remove something.

```tsx
<Menu
  items={[
    { label: 'Duplicate', icon: 'copy-plus', shortcut: 'Ctrl+D', onSelect: duplicate },
    'separator',
    { label: 'Delete', icon: 'trash-2', danger: true, onSelect: remove },
  ]}
>
  <Button leadingIcon="ellipsis" aria-label="Actions" />
</Menu>
```

#### `children`

The trigger: one element that takes a ref and events, usually a [Button](../components/button.md). **Type:** `ReactElement`. **Required.**

#### `side`

Which side of the trigger it opens on; it flips when there isn't room. **Type:** `'top' | 'right' | 'bottom' | 'left'`. **Default:** `'bottom'`.

#### `align`

How it lines up with the trigger along that side. **Type:** `'start' | 'center' | 'end'`. **Default:** `'start'`.

```tsx
<Menu items={items} align="end">…</Menu>
```

#### `aria-label`

Names the menu, e.g. `'Actions for Card'`. **Type:** `string`. **Default:** none.

#### `open` and `onOpenChange`

Control it, e.g. to open it from a keyboard shortcut. Leave both out and it opens and closes itself. **Type:** `boolean` and `(open: boolean) => void`.

```tsx
const [open, setOpen] = useState(false);
<Menu items={items} open={open} onOpenChange={setOpen}>…</Menu>
```

## Examples

### Example: A menu of actions

A button opening three actions, one disabled; choosing one shows which.

```example
ui-library/menu/basic
```

### Example: Shortcut hints and a danger row

An icon button's menu, as on a row of a list: shortcut hints, a separator and a red Delete.

```example
ui-library/menu/shortcuts-and-danger
```

## Accessibility

- **Behaviour from Radix:** the panel is a `role="menu"` of `role="menuitem"` rows. Enter, Space or the down arrow on the trigger opens it with the first row focused; the arrow keys move, typing a letter jumps to the matching row, Enter or Space chooses, Escape closes and focus returns to the trigger.
- **Name icon-only triggers** with `aria-label` on the button, and name the menu too.
- **Shortcut hints** are hidden from screen readers; they describe keys the page handles itself.
- **Danger** is shown by colour and by the action's own words (e.g. "Delete"), never colour alone.

## Notes

- **Layering:** it renders in a portal at the end of the page at z-index 50, above modals (40), so a menu inside a Modal shows above it.
- **Not modal:** the page stays usable while it's open; a click elsewhere closes it.
- **Fixed look:** a surface 50 panel, 8px radius, `lg` shadow, 200–320px wide; 32px rows of 14px text; the highlighted row on surface 200. It fades and scales in, without motion under reduced motion.
- **Not yet:** submenus, checkable items, or opening on right-click.
