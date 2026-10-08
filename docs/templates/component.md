---
title: ComponentName
description: One sentence: what it is and when to use it.
scope: core
tags: [ui, component]                    # add the concerns it covers, e.g. layout, typography, forms
order: 1                                 # position within its layer's section
decisions: []                            # decisions that shape this component
component:
  name: ComponentName                    # the exported PascalCase name
  layer: component                       # component | composite | layout
  import: '@inithium/shared-ui-components'
  element: div                           # the element it renders by default (omit if not applicable)
---

# ComponentName

What it is, what it's for, and when to reach for something else instead. Save this file as
reference/ui/<layer>s/<kebab-name>.md (e.g. reference/ui/components/date-picker.md); the docs check
requires a page for every exported component, composite and layout.

## Import

```tsx
import { ComponentName } from '@inithium/shared-ui-components';
```

## Basic usage

The smallest useful example.

## Props

Every prop the component accepts, grouped. Shared shapes (colour value, sides, size, radius, variants) link to
[Style props](../style-props.md) rather than being repeated.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `example` | `Variants<Colour>` | none | What it does. |

Group further tables by concern (element, colour, spacing, sizing, borders, layout, typography, animation,
runtime props, HTML attributes and `ref`).

## Styling examples

Recipes showing the different ways the props combine: states, breakpoints, theme colours, layout.

## Accessibility

Semantics, keyboard behaviour, labelling, and anything the caller must provide.

## Notes

Edge cases, interactions between props, and what isn't supported yet.
