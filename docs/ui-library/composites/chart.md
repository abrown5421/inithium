---
title: Chart
description: Line and bar charts drawn by Chart.js in the theme's colours, loaded on demand, with a table for screen readers.
scope: core
tags: [ui, composite, chart, data]
order: 20
decisions: ["0120"]
component:
  name: Chart
  layer: composite
  import: '@inithium/shared-ui-composites'
---

# Chart

Chart draws a line or bar chart ([0120](../../decisions/0120-give-each-cms-user-a-dashboard-of-widgets.md)), e.g. the CMS dashboard's Members widget. It wraps [Chart.js](https://www.chartjs.org/): never use Chart.js directly, and extend Chart's props when it can't do something.

- **Loaded on demand:** Chart.js is downloaded the first time a chart draws, so apps and pages without charts never load it.
- **Theme colours:** Chart.js draws on a canvas, which can't read the theme's CSS variables. Chart reads each colour from the page when it draws and draws again when the colour scheme or theme changes, so charts follow re-brands and [dark mode](../theme/dark-mode.md).

## Import

```tsx
import { Chart, type ChartSeries } from '@inithium/shared-ui-composites';
```

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`label`](#label) | `string` | required | Names the chart for screen readers and captions its table |
| [`labels`](#labels) | `string[]` | required | The x axis: one label per value |
| [`series`](#series) | `ChartSeries[]` | required | The lines or sets of bars |
| [`type`](#type) | `'line' \| 'bar'` | `'line'` | How values are drawn |
| [`height`](#height) | `number \| 'full'` | `240` | Its height |
| [`area`](#area) | `boolean` | `false` | Fills the area under each line |
| [`legend`](#legend) | `boolean` | with 2+ series | Shows each series' name above the chart |
| [`formatValue`](#formatvalue) | `(value: number) => string` | the viewer's number format | How values are written |

## Props

#### `label`

What the chart shows, e.g. `'Members over the past month'`. Screen readers read it as the caption of the chart's table. **Type:** `string`. **Required.**

#### `labels`

The x axis, one label per value, e.g. dates. Labels that don't fit are skipped. **Type:** `string[]`. **Required.**

#### `series`

The lines (or sets of bars): `{ label, data, color? }`. `data` has a value for each of `labels`. `color` is a [colour value](../style-props.md#colour-value); the default is the theme's brand colours in turn, from `primary`. **Type:** `ChartSeries[]`. **Required.**

```tsx
<Chart
  label="Sign-ups by week"
  labels={['Oct 5', 'Oct 12', 'Oct 19']}
  series={[
    { label: 'Members', data: [4, 9, 6] },
    { label: 'Staff', data: [1, 0, 2], color: { color: 'secondary', intensity: 600 } },
  ]}
/>
```

#### `type`

`'line'` draws each series as a smoothed line with points (points hide past 40 values); `'bar'` as rounded bars side by side. **Type:** `'line' | 'bar'`. **Default:** `'line'`.

#### `height`

A height in px, or `'full'` to fill a parent that has a height, e.g. a dashboard widget's body. It always fills its parent's width. **Type:** `number | 'full'`. **Default:** `240`.

```tsx
<Chart label="…" labels={labels} series={series} height="full" />
```

#### `area`

Fills the area under each line in its colour, faintly. Lines only. **Type:** `boolean`. **Default:** `false`.

#### `legend`

Shows each series' name and colour above the chart. **Type:** `boolean`. **Default:** shown when there's more than one series.

#### `formatValue`

How values are written on the y axis, in tooltips and in the table, e.g. as currency. The y axis only shows whole numbers. **Type:** `(value: number) => string`. **Default:** `value.toLocaleString()`.

```tsx
<Chart label="Revenue" labels={labels} series={series} formatValue={(value) => `£${value.toLocaleString()}`} />
```

## Examples

### Example: A line with its area filled

One series over a fortnight, the area under it filled.

```example
ui-library/chart/line
```

### Example: Bars for two series

Two series as bars, with a legend and values written as currency.

```example
ui-library/chart/bars
```

## Accessibility

- **The canvas is hidden from screen readers.** They read a visually hidden table instead, captioned by `label`, with a column per series and a row per label. Keep `label` specific (what, and over when).
- **Colour isn't the only cue:** with more than one series the legend names them, and tooltips name each value's series.
- **Tooltips** show on hover and touch; the same values are in the table.
- **Reduced motion:** charts draw without animating.

## Notes

- **Fixed look:** the body font at 12px; axis text in surface 700; grid lines in surface 500 at 25%, with none down the x axis; tooltips on surface 900 with surface 100 text; bars with 4px corners.
- **y axis** starts at zero.
- **Not yet:** other chart types (pie, doughnut, scatter), stacked bars, a second y axis, or clicking a value. Chart.js supports them; add props when a feature needs one.
