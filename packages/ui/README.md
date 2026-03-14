# @inithium/ui

A shared React component library for the Inithium monorepo, built on [Headless UI v2](https://headlessui.com/) and [Tailwind CSS v4](https://tailwindcss.com/).

## Components

| Component | Description |
|-----------|-------------|
| `Button` | 4 variants × 5 sizes, loading state, left/right icons |
| `Input` | Label, description, error, left/right adornments |
| `Badge` | 6 variants, dot indicator, removable |
| `Card / CardHeader / CardBody / CardFooter` | Flexible content container |
| `Tooltip` | 4 placement options, CSS-only transitions |
| `Dialog` | Modal with backdrop blur, configurable footer |
| `Popover` | Anchored floating panel |
| `Menu` | Dropdown with sections, icons, keyboard shortcuts |
| `Tabs` | 3 variants: underline, pills, boxed |
| `Disclosure` | Accordion / FAQ with animated chevron |
| `Switch` | 3 sizes, with optional label + description |
| `Checkbox` | Indeterminate state, label + description |
| `RadioGroup` | Default list or card variant |
| `Select` | Listbox with icons and descriptions |
| `Combobox` | Filterable autocomplete |

## Usage

```tsx
import { Button, Dialog, Tabs } from '@inithium/ui';
import '@inithium/ui/styles'; // import in your root styles.css instead
```

## Setup

1. Drop `packages/ui` into your monorepo alongside `packages/shared`.
2. Add `@inithium/ui: "workspace:*"` to your app's `package.json`.
3. In `vite.config.mts`, add the alias:
   ```ts
   '@inithium/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
   ```
4. In your app's `tsconfig.app.json`, add the reference:
   ```json
   { "path": "../../packages/ui/tsconfig.lib.json" }
   ```
5. In `styles.css`:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..700&display=swap');
   @import "@inithium/ui/styles";
   ```

## Theming

All design tokens live in `src/styles/globals.css` inside the `@theme` block. Override any token to re-skin the entire library:

```css
@theme {
  --color-brand-600: #7c3aed; /* swap to purple */
  --font-sans: "Geist", system-ui, sans-serif;
}
```
