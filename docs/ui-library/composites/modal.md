---
title: Modal
description: A dialog over the page, with a dark overlay and a centred panel that animates in and out, holding any content and openable from anywhere through Redux.
scope: core
tags: [ui, composite, overlays]
order: 4
decisions: ["0048", "0056", "0062", "0065"]
component:
  name: Modal
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# Modal

Modal shows content in a panel over the page ([0065](../../decisions/0065-open-modals-by-id-from-global-state.md)). A dark overlay fades in behind it, the panel animates in (`fadeInUp` by default), and on close the panel animates out (`fadeOutDown`) while the overlay fades away. The panel holds anything: text, forms, images, buttons. Clicking the overlay, pressing Escape or the ✕ closes it. Its behaviour comes from [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)): focus stays inside the modal, the page behind doesn't scroll, and focus returns to the button that opened it.

Modal is controlled by `open` and `onOpenChange`. To open modals **from anywhere** in an app, connect each one to the global modal state with `useModal(id)`, then open it with `dispatch(openModal(id))` from any component.

## Import

```tsx
import { Modal } from '@inithium/shared-ui-composites';
import { openModal, closeModal, useModal } from '@inithium/shared-data-access';   // for the global state
```

## Opening modals from anywhere

The app's Redux store (from `createAppStore()`) holds which modal is open, by id. Only one is open at a time: opening another replaces it.

1. **Declare the modal once**, usually at the app root, and connect it with `useModal`:

   ```tsx
   function InviteModal() {
     const invite = useModal('invite');
     return (
       <Modal {...invite.modalProps} title="Invite a teammate">
         <InviteForm onDone={invite.close} />
       </Modal>
     );
   }

   // App root
   <Provider store={store}>
     <UiProvider>
       <Routes>…</Routes>
       <InviteModal />
     </UiProvider>
   </Provider>
   ```

2. **Open it from any component**, however deep:

   ```tsx
   const dispatch = useDispatch();
   <Button onClick={() => dispatch(openModal('invite'))}>Invite</Button>

   // or, inside a component that has the hook:
   const { open } = useModal('invite');
   ```

`useModal(id)` returns `isOpen`, `open()`, `close()` and `modalProps` (`{ open, onOpenChange }`, to spread onto the Modal). `closeModal(id)` closes that modal if it's the open one; `closeModal()` closes whichever is open. Where a modal is declared doesn't affect where it appears: it always renders over the whole page.

For a modal that only one component uses, plain state works too: `<Modal open={open} onOpenChange={setOpen}>`.

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md). `open`, `onOpenChange` and `title` are required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`open`, `onOpenChange`](#open-and-onopenchange) | `boolean`, `(open) => void` | **required** | Whether it's open |
| [`title`](#title-and-hidetitle) | `ReactNode` | **required** | Heading and accessible name |
| [`hideTitle`](#title-and-hidetitle) | `boolean` | `false` | Title for screen readers only |
| [`description`](#description) | `string` | none | A line under the title |
| [`children`](#children) | `ReactNode` | none | The content |
| [`dismissible`](#dismissible) | `boolean` | `true` | Overlay click and Escape close it |
| [`closeButton`](#closebutton) | `boolean` | `true` | ✕ in the top-right corner |
| [`animation`](#animation) | `Animation` | `fadeInUp` / `fadeOutDown` | The panel's entrance and exit |
| [`overlayColor`](#overlaycolor) | `Colour` | neutral 950 at 60% | The overlay |
| [Panel style props](#panel-style-props) | Container's | see below | The panel's look |

## Props

### Opening and closing

#### `open` and `onOpenChange`

Whether the modal is open, and the function called with `false` when the user closes it. Setting `open` to `false` plays the exit animation; the modal leaves the page when it ends. **Type:** `boolean`, `(open: boolean) => void`. **Required.**

```tsx
const [open, setOpen] = useState(false);
<Button onClick={() => setOpen(true)}>Open</Button>
<Modal open={open} onOpenChange={setOpen} title="Hello">…</Modal>

// Or connected to the global state:
<Modal {...useModal('hello').modalProps} title="Hello">…</Modal>
```

#### `dismissible`

Whether clicking the overlay or pressing Escape closes the modal. Turn it off when closing by accident would lose work, e.g. a form with unsaved changes; the ✕ and your own buttons still close it. **Type:** `boolean`. **Default:** `true`.

```tsx
<Modal open={open} onOpenChange={setOpen} title="Edit profile" dismissible={false}>…</Modal>
```

#### `closeButton`

Whether an ✕ button shows in the top-right corner. Leave it on unless the content has its own clear way out, as in a confirmation with Cancel. **Type:** `boolean`. **Default:** `true`.

### Content

#### `title` and `hideTitle`

The modal's heading, shown at the top of the panel, and its name for screen readers (required by Radix). `hideTitle` keeps it for screen readers only, for content that has its own heading. **Type:** `ReactNode`, `boolean`. **Default:** `hideTitle` is `false`.

```tsx
<Modal title="What's new" hideTitle …>
  <Text as="h2">What's new</Text>
  …
</Modal>
```

#### `description`

A line under the title, read with it by screen readers. **Type:** `string`.

#### `children`

The content: anything. The panel scrolls when its content is taller than the window. **Type:** `ReactNode`.

### Look

#### `animation`

The panel's entrance and exit, in the [animation prop's](../animations/index.md) shape, so names, speeds and delays all work. The overlay always fades in and out. **Type:** `{ entrance?, exit? }`. **Default:** `{ entrance: { name: 'fadeInUp', speed: 'fast', delay: 150 }, exit: { name: 'fadeOutDown', speed: 'fast' } }`.

```tsx
<Modal animation={{ entrance: { name: 'zoomIn', speed: 'faster' }, exit: { name: 'zoomOut', speed: 'faster' } }} …>
<Modal animation={{ entrance: { name: 'slideInDown' }, exit: { name: 'slideOutUp' } }} …>
```

#### `overlayColor`

The overlay behind the panel, a [colour value](../style-props.md#colour-value). The default is a fixed dark neutral, so it stays dark when dark mode arrives. **Type:** `Colour`. **Default:** `{ color: 'neutral', intensity: 950, opacity: 60 }`.

```tsx
<Modal overlayColor={{ color: 'primary', intensity: 950, opacity: 50 }} …>
```

#### Panel style props

The panel is a [Container](../components/container.md), and takes its style props (except `as`), which override the defaults:

| Prop | Default |
| --- | --- |
| `width` / `maxWidth` | `'full'` / `480` |
| `maxHeight` | `'full'` (the window, less 16px each side) |
| `padding` | `{ all: 24 }` |
| `radius` | `{ all: 12 }` |
| `bgColor` | `{ color: 'surface', intensity: 50 }` |
| `shadow` | `'xl'` |

```tsx
<Modal maxWidth={720} padding={{ all: 32 }} bgColor={{ color: 'secondary', intensity: 50 }} …>
```

## Examples

### Example: Basic

A title, description, text and a button, with local state.

```example
ui-library/modal/basic
```

### Example: Open from anywhere

A button in one component opens a modal declared in another, through Redux.

```example
ui-library/modal/open-from-anywhere
```

### Example: Form in a modal

A form with an Input and a Select (whose list opens above the modal); the overlay and Escape don't close it.

```example
ui-library/modal/form-in-a-modal
```

### Example: Confirm dialog

A small destructive confirmation that zooms in, with no ✕.

```example
ui-library/modal/confirm-dialog
```

### Example: Custom look

A wider, tinted panel with a hidden title, a tinted overlay, and slide animations.

```example
ui-library/modal/custom-look
```

### Example: Long content

Content taller than the window scrolls inside the panel.

```example
ui-library/modal/long-content
```

## Accessibility

- **Behaviour from Radix Dialog:** the panel is a `role="dialog"` with `aria-modal`, named by `title` and described by `description`. Focus moves into the modal when it opens (to the first focusable element) and stays there; Tab cycles inside it. The page behind is hidden from screen readers and doesn't scroll. On close, focus returns to the element that opened it.
- **Escape** closes it (unless `dismissible={false}`).
- **Always give a `title`,** even when hidden.
- **Reduced motion:** the overlay and panel appear and disappear without movement, as with every animation.

## Notes

- **Layering:** modals sit at z-index 40 and popups at 50, so a [Select](../components/select.md)'s list or a [Tooltip](../components/tooltip.md) inside a modal appears above it ([0065](../../decisions/0065-open-modals-by-id-from-global-state.md)). Both render at the end of the page.
- **One at a time:** opening a modal while another is open replaces it. Stacked modals aren't supported yet.
- **Unmounting:** the modal leaves the page after the panel's exit animation ends; until then, focus stays inside it.
- **Focus** returns to whatever was focused when the modal opened, even when it was opened through Redux, and clicks on the overlay never move focus out of the modal.
- **Long content:** the ✕ scrolls with the panel's content. In long modals, keep a close or done button at the end too.
- **The web app has no store yet,** so `useModal` works in the cms (and here in the docs); the web app gets a store when it first needs one.
- **Schema:** `modalPropsSchema` (type `ModalSerializableProps`) in `@inithium/shared-contracts`. The content (`children`) and `open` aren't stored.
