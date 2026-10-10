---
title: Pagination
description: Moves through pages of a list with previous and next arrows around the page numbers, with gaps in long ranges.
scope: core
tags: [ui, composite, navigation]
order: 10
decisions: ["0054", "0062", "0072", "0073"]
component:
  name: Pagination
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: nav
---

# Pagination

Pagination moves through the pages of a list ([0073](../../decisions/0073-page-through-lists-with-a-fixed-length-row.md)). The page numbers sit between a ← and a → arrow that move one page at a time; clicking a number jumps to that page. In long ranges, the row shows the first and last pages and the current page's neighbours, with "…" for the gaps, and keeps the same length wherever you are, so the buttons don't move under the pointer:

```
←  1  …  4  [5]  6  …  20  →
←  [1]  2  3  4  5  …  20  →
```

Optionally it adds first and last buttons, a "Rows per page" select, a "21–40 of 312" summary, or a compact "Page 5 of 20" mode. Pages are buttons, or real links with `getPageHref`.

## Import

```tsx
import { Pagination } from '@inithium/shared-ui-composites';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md). `pageCount` is required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`pageCount`](#pagecount) | `number` | **required** | How many pages |
| [`page`, `defaultPage`, `onPageChange`](#page-defaultpage-and-onpagechange) | `number` | `1` | The current page |
| [`siblingCount`](#siblingcount) | `number` | `1` | Neighbours each side of the current page |
| [`showFirstLast`](#showfirstlast) | `boolean` | `false` | First and last buttons |
| [`compact`](#compact) | `boolean` | `false` | 'Page 5 of 20' instead of numbers |
| [`getPageHref`](#getpagehref) | `(page) => string` | buttons | Pages as real links |
| [`pageSizeOptions`, `pageSize`, `onPageSizeChange`](#pagesizeoptions-pagesize-and-onpagesizechange) | | none | 'Rows per page' select |
| [`totalItems`](#totalitems) | `number` | none | '21–40 of 312' summary |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | Current page and focus |
| [`aria-label`](#aria-label) | `string` | `'Pagination'` | Names the control |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `pageCount`

How many pages there are. With one page, Pagination still shows "1" with both arrows disabled, so a short list's layout doesn't change. **Type:** `number`. **Required.**

#### `page`, `defaultPage` and `onPageChange`

The current page, counting from 1. Pass `page` to control it, or `defaultPage` to let Pagination hold its own. `onPageChange` receives the new page. **Type:** `number`, `(page: number) => void`. **Default:** page `1`.

```tsx
const [page, setPage] = useState(1);
<Pagination pageCount={20} page={page} onPageChange={setPage} />
```

#### `siblingCount`

How many pages show each side of the current one in a long range. The row is `5 + 2 × siblingCount` slots long. **Type:** `number`. **Default:** `1`.

```tsx
<Pagination pageCount={50} siblingCount={2} />   // 1 … 23 24 [25] 26 27 … 50
```

#### `showFirstLast`

Adds « and » buttons that jump to the first and last pages. **Type:** `boolean`. **Default:** `false`.

#### `compact`

Shows "Page 5 of 20" between the arrows instead of page numbers, for narrow spaces. **Type:** `boolean`. **Default:** `false`.

#### `getPageHref`

Makes each page a real link to the address it returns, so pages can be bookmarked, shared and opened in new tabs. A plain click still calls `onPageChange` (and doesn't load the page), so the app's router can follow it, as with [Breadcrumbs](breadcrumbs.md#onnavigate). The arrows stay buttons. **Type:** `(page: number) => string`.

```tsx
<Pagination pageCount={12} page={page} onPageChange={setPage} getPageHref={(p) => `/friends?page=${p}`} />
```

#### `pageSizeOptions`, `pageSize` and `onPageSizeChange`

Adds a "Rows per page" [Select](../components/select.md) at the end of the row with these sizes. `pageSize` is the current size (by default the first option) and `onPageSizeChange` receives a new one; changing the size goes back to page 1. **Type:** `number[]`, `number`, `(size: number) => void`.

```tsx
<Pagination pageCount={Math.ceil(total / size)} pageSize={size} onPageSizeChange={setSize} pageSizeOptions={[10, 25, 50]} … />
```

#### `totalItems`

With a page size, shows which items are on screen at the start of the row: "21–40 of 312". **Type:** `number`.

#### `color`

The current page's fill (its number in the colour's 100 step, as on a filled [Button](../components/button.md#variant)), the other numbers and arrows, and the focus outline. **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

#### `aria-label`

Names the control for screen readers, e.g. "Search results pages" when a page has more than one. **Type:** `string`. **Default:** `'Pagination'`.

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px. **Type:** `Variants<Sides>`.

#### `animation`

The [animation prop](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Basic

Twenty pages, starting on page 5.

```example
ui-library/pagination/basic
```

### Example: Short and single

Five pages with no gaps, and a single page.

```example
ui-library/pagination/short-and-single
```

### Example: First, last and siblings

First and last buttons, and two neighbours each side in the secondary colour.

```example
ui-library/pagination/first-last-and-siblings
```

### Example: Table with page size

A paged list with a summary and a 'Rows per page' select.

```example
ui-library/pagination/table-with-page-size
```

### Example: Links

Pages as real links: hover one to see its address, or open it in a new tab.

```example
ui-library/pagination/links
```

### Example: Compact

'Page 5 of 20' between the arrows.

```example
ui-library/pagination/compact
```

## Accessibility

- **Structure:** a `<nav>` named "Pagination" (or your `aria-label`) around a list of buttons or links; gaps are hidden from screen readers.
- **Labels:** numbers are read as "Page 5"; the current one has `aria-current="page"`. The arrows are "Previous page" and "Next page" (and "First page", "Last page").
- **Keyboard:** Tab moves through the arrows and pages; Enter or Space activates. Focus stays on the button you used; if it becomes disabled (← on the first page), focus moves to the current page.
- **Disabled arrows** use the native `disabled` attribute.

## Notes

- **Fixed metrics:** square page items at least 32px (wider for long numbers), 4px apart, 14px text, 16px icons; they look like ghost [Buttons](../components/button.md), with the current page filled.
- **The page is clamped** to between 1 and `pageCount`.
- **Schema:** `paginationPropsSchema` (type `PaginationSerializableProps`) in `@inithium/shared-contracts`. `page`, `pageCount`, `pageSize`, `totalItems` and the callbacks aren't stored.
