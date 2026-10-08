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
ui-library/<layer>s/<kebab-name>.md (e.g. ui-library/components/date-picker.md); the docs check
requires a page for every exported component, composite and layout.

## Import

```tsx
import { ComponentName } from '@inithium/shared-ui-components';
```

## Props at a glance

Every prop the component accepts, in one table for scanning. Shared shapes (colour value, sides, size, radius,
variants) link to [Style props](../style-props.md) rather than being repeated.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`example`](#example) | `Variants<Colour>` | none | What it does. |

## Props

One subsection per prop, grouped under `### <Group>` headings (element, colour, spacing, sizing, borders,
layout, typography, animation, HTML attributes). Each prop gets its type, default and a code snippet covering
every way it can be written.

#### `example`

What it does. **Type:** `Variants<Colour>`. **Default:** none.

```tsx
<ComponentName example="primary" />                                   // simplest form
<ComponentName example={{ color: 'primary', intensity: 200 }} />      // full form
<ComponentName example={{ base: 'primary', hover: 'secondary' }} />   // with variant keys
```

## Examples

Showcase what the component can do. Each example is its own block so a docs site can render it as a live
preview: a `### Example: <title>` heading, one sentence on what it shows, and a self-contained snippet
(imports included).

### Example: Short title

One sentence on what this shows.

```tsx
import { ComponentName } from '@inithium/shared-ui-components';

export function ExampleShortTitle() {
  return <ComponentName />;
}
```

## Accessibility

Semantics, keyboard behaviour, labelling, and anything the caller must provide.

## Notes

Edge cases, interactions between props, and what isn't supported yet.
