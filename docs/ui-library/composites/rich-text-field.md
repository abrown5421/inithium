---
title: RichTextField
description: A WYSIWYG multi-line field built on TipTap, limited to the formatting you allow, with a character limit, saving rich text JSON.
scope: core
tags: [ui, composite, forms, rich-text]
order: 16
decisions: ["0093", "0102"]
component:
  name: RichTextField
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# RichTextField

RichTextField is the UI library's multi-line field ([0102](../../decisions/0102-edit-rich-text-fields-with-tiptap-and-store-json.md)): bios, blog post bodies, product descriptions, anything longer than a line. It's [TipTap](https://tiptap.dev)'s editor in an outlined box like [Input](../components/input.md)'s, with a toolbar for the formatting the field allows and, with `maxLength`, a character count that stops you at the limit.

It saves a **rich text document**: Inithium's JSON, never HTML. Draw it with [RichTextView](rich-text-view.md). Validate it on the api with `restrictedRichTextSchema()` (below), so the server enforces what the field allows; the editor alone can't, since anyone can send the api data directly.

## Import

```tsx
import { RichTextField } from '@inithium/shared-ui-composites';
```

## Props at a glance

`label` is required. Style props aren't taken; the field fills the width it's given.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`label`](#label) | `string` | required | Above the box |
| [`value`, `defaultValue`, `onChange`](#value-defaultvalue-and-onchange) | `RichTextDocument` | empty | The document |
| [`features`](#features) | `RichTextFeature[]` | all | The formatting offered and allowed |
| [`maxLength`](#maxlength) | `number` | none | Most characters; shows a count |
| [`placeholder`](#placeholder) | `string` | none | Shown while empty |
| [`helperText`](#helpertext-and-error) | `string` | none | Under the box |
| [`error`](#helpertext-and-error) | `boolean \| string` | none | Marks it invalid |
| [`required`](#required-and-disabled) | `boolean` | `false` | Adds * to the label |
| [`disabled`](#required-and-disabled) | `boolean` | `false` | Read-only, faded |
| [`minHeight`](#minheight) | `number` | `120` | Least height of the text area, px |
| [`color`](#color) | `Colour` | `primary` | Focus ring and active toolbar buttons |

## Props

#### `label`

The field's name, above the box, and the editable area's accessible name. Clicking it focuses the text. **Type:** `string`. **Required.**

#### `value`, `defaultValue` and `onChange`

The document. With `value` the field is controlled; otherwise it keeps its own, starting from `defaultValue`. `onChange` gets the new document after every change. An empty field is one empty paragraph: check with `richTextIsEmpty(doc)`. **Type:** `RichTextDocument`. **Default:** empty.

```tsx
const [body, setBody] = useState<RichTextDocument>();
<RichTextField label="Body" value={body} onChange={setBody} />
<RichTextField label="Notes" defaultValue={richTextFromPlainText('Start here')} onChange={save} />
```

#### `features`

The formatting the toolbar offers, and the only formatting the editor knows. Pasted formatting outside it is dropped (a pasted heading becomes a paragraph). Paragraphs and line breaks (Shift+Enter) are always allowed. **Type:** `RichTextFeature[]`, any of `'bold'`, `'italic'`, `'underline'`, `'link'`, `'heading'`, `'bulletList'`, `'orderedList'`, `'blockquote'`. **Default:** all of them (`richTextFeatures`).

```tsx
<RichTextField label="Bio" features={bioFeatures} />                    // bold, italic, link
<RichTextField label="Summary" features={['bold', 'italic']} />
<RichTextField label="Post" features={richTextFeatures} />              // everything
```

- **Links** open a row under the toolbar for the address. It must start with `https://`, `http://`, `mailto:` or `tel:`. A link to one of the site's pages is only possible in the page editor.
- **Heading** makes an h2 (the page's title is its h1).
- Keyboard shortcuts work for what's allowed: Ctrl/⌘+B, Ctrl/⌘+I, Ctrl/⌘+U.

#### `maxLength`

The most characters the field takes, enforced by TipTap as you type (a paste is cut to fit). A count, e.g. "48/280", shows under the box and turns red when full. Characters are counted as `richTextLength()` counts them: visible characters, each line break as one. **Type:** `number`. **Default:** no limit.

```tsx
<RichTextField label="Bio" maxLength={profileLimits.bio} />
```

#### `placeholder`

Faint text shown while the field is empty. **Type:** `string`. **Default:** none.

#### `helperText` and `error`

`helperText` shows under the box. `error` marks the field invalid: a red border and, given a message, the message in place of the helper text. It hides as soon as the text is edited, like Input's. **Type:** `string`, `boolean | string`. **Default:** none.

```tsx
<RichTextField label="Bio" helperText="Shown on your profile." error={errors.bio} />
```

#### `required` and `disabled`

`required` adds * to the label (the form checks it). `disabled` makes the text read-only and fades the field. **Type:** `boolean`. **Default:** `false`.

#### `minHeight`

The text area's least height in px; it grows with the text. **Type:** `number`. **Default:** `120`.

#### `color`

The focus ring and the active toolbar buttons, as a [colour value](../style-props.md#colour-value). **Type:** `Colour`. **Default:** `'primary'`.

### Validating on the api

```ts
import { restrictedRichTextSchema } from '@inithium/shared-contracts';

export const productDescriptionSchema = restrictedRichTextSchema({
  features: ['bold', 'italic', 'link', 'bulletList'],
  maxLength: 2000,
  urlLinksOnly: true, // no links to the site's pages
});
```

It refuses formatting outside `features`, more than `maxLength` characters, and (with `urlLinksOnly`) page links, each with a message a form can show.

## Examples

### Example: Basic

Every feature, with a placeholder, and the document's size as it changes.

```example
ui-library/rich-text-field/basic
```

### Example: A bio

The bio's features and its 280-character limit, as on the profile.

```example
ui-library/rich-text-field/bio
```

### Example: States

Required with an error, disabled with text, and another colour.

```example
ui-library/rich-text-field/states
```

## Accessibility

- The editable area is a `textbox` with `aria-multiline`, named by the label and described by the helper text or error. `aria-invalid` is set while an error shows.
- The toolbar is a `toolbar` named after the field. Each button has a label and a tooltip, and `aria-pressed` shows whether its formatting is on.
- Toolbar buttons don't take focus from the text, so the selection stays.

## Notes

- **Not an HTML editor.** What's saved is JSON; HTML never reaches the database or the page.
- The page editor's in-place text editing is the same TipTap setup with every feature and page links ([Content pages](../../architecture/content-pages.md)).
- `focusFirstError()` can't focus it (it isn't a form element); show its error and the form's alert as usual.
