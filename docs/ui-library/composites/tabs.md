---
title: Tabs
description: A set of panels with one shown at a time, chosen by tabs with an underline that slides to the active one.
scope: core
tags: [ui, composite, navigation]
order: 4
decisions: ["0048", "0056", "0068"]
component:
  name: Tabs
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# Tabs

Tabs shows one panel at a time, chosen from a bar of tabs ([0068](../../decisions/0068-switch-panels-with-tabs-built-from-data.md)). The active tab's label darkens and an underline in `color` slides under it; the new panel fades in. Its behaviour comes from [Radix Tabs](https://www.radix-ui.com/primitives/docs/components/tabs) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)), including arrow-key navigation.

Tabs are data, `{ value, label, icon?, disabled?, content }`, so their labels can be stored; `content` is any React content.

## Import

```tsx
import { Tabs, type TabsItem } from '@inithium/shared-ui-composites';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md). `tabs` is required, and the tab bar should be named with `aria-label`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`tabs`](#tabs) | `TabsItem[]` | **required** | The tabs and their content |
| [`value`, `defaultValue`, `onValueChange`](#value-defaultvalue-and-onvaluechange) | `string` | first enabled tab | The active tab |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | Underline and focus |
| [`fill`](#fill) | `boolean` | `false` | Tabs share the bar's width |
| [`keepMounted`](#keepmounted) | `boolean` | `false` | Keep inactive panels rendered |
| [`aria-label`](#aria-label) | `string` | none | Names the tab bar |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `tabs`

The tabs, in order: `value` (unique, non-empty), `label`, and optionally `icon` (a [Lucide name](../components/icon.md#name)), `disabled` and the panel's `content`. **Type:** `TabsItem[]`. **Required.**

```tsx
<Tabs
  aria-label="Inbox"
  tabs={[
    { value: 'inbox', label: 'Inbox', icon: 'inbox', content: <MessageList /> },
    { value: 'sent', label: 'Sent', icon: 'send', content: <SentList /> },
    { value: 'archive', label: 'Archive', disabled: true, content: null },
  ]}
/>
```

#### `value`, `defaultValue` and `onValueChange`

The active tab's `value`. Pass `value` to control it, or `defaultValue` to choose the first active tab and let Tabs hold its own. **Type:** `string`, `(value: string) => void`. **Default:** the first tab that isn't disabled.

```tsx
const [step, setStep] = useState('details');
<Tabs value={step} onValueChange={setStep} tabs={steps} />
```

#### `color`

The active tab's underline and the keyboard focus outline. **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

#### `fill`

Stretches the tabs to share the bar's width equally, e.g. for two or three tabs in a narrow card. Without it, tabs are as wide as their labels, and the bar scrolls sideways when they don't fit. **Type:** `boolean`. **Default:** `false`.

```tsx
<Tabs fill tabs={[signIn, register]} />
```

#### `keepMounted`

Keeps inactive panels rendered but hidden, so what's typed into a form in another tab survives switching. Without it, only the active panel is rendered. **Type:** `boolean`. **Default:** `false`.

#### `aria-label`

Names the tab bar for screen readers, e.g. "Account settings". **Type:** `string`.

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px, around the whole Tabs. **Type:** `Variants<Sides>`.

#### `animation`

The [animation prop](../animations/index.md), for the whole Tabs. Switching panels has its own short fade. **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Basic

Three tabs with text panels.

```example
ui-library/tabs/basic
```

### Example: Icons and disabled

Icons before the labels, and a disabled tab.

```example
ui-library/tabs/icons-and-disabled
```

### Example: Fill

Two tabs sharing a narrow card's width, in the secondary colour.

```example
ui-library/tabs/fill
```

### Example: Controlled

A button outside the tabs moves to the next step.

```example
ui-library/tabs/controlled
```

### Example: Keep mounted

Type in one tab, switch away and back: the text is still there.

```example
ui-library/tabs/keep-mounted
```

### Example: Many tabs

Twelve tabs in a narrow space: the bar scrolls sideways.

```example
ui-library/tabs/many-tabs
```

## Accessibility

- **Behaviour from Radix:** the bar is a `role="tablist"`, each tab a `role="tab"`, each panel a `role="tabpanel"` labelled by its tab. Tab moves into the bar (to the active tab) and then into the panel; the left and right arrows move between tabs and switch immediately; Home and End go to the first and last. Disabled tabs are skipped.
- **Name the bar** with `aria-label`.
- **The active tab** is marked by its darker label and underline, not by colour alone.
- **Reduced motion:** the underline jumps and panels appear without fading.

## Notes

- **Fixed metrics:** 40px tabs with 16px side padding, 14px semibold labels, 16px icons, a 2px underline, a 1px divider under the bar, and 16px between the bar and the panel.
- **Horizontal only** for now.
- **Schemas:** `tabsPropsSchema` (type `TabsSerializableProps`) and `tabItemSchema` (type `TabItem`) in `@inithium/shared-contracts`. Tab content isn't stored.
