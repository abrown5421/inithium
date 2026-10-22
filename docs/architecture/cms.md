---
title: The CMS
description: How the CMS app is put together - its frame, screens, sign-in, the Dashboard, the Pages editor, the Media library and the Users screen - and how to add a screen.
scope: core
tags: [cms, architecture, permissions]
order: 7
decisions: ["0083", "0086", "0087", "0098", "0099", "0100", "0101", "0119", "0120", "0122", "0124"]
---

# The CMS

The CMS (`apps/cms`, served at `/cms`) is the client portal, where owners, admins and editors manage the site ([0086](../decisions/0086-run-the-cms-in-a-sidebar-frame-with-a-pages-screen.md)). It's a separate app from `web` with its own plain routes, and like every app it only composes libs.

## How it fits together

```
apps/cms   App: the routes and the list of screens
  /login                  LoginPage           @inithium/cms-auth
  everything else         CmsAccessGuard      @inithium/cms-auth   (signed in with cms.access)
    CmsShell              SidebarLayout frame  @inithium/cms-shell
      /                   DashboardScreen      @inithium/cms-dashboard
      /pages              PagesScreen          @inithium/cms-pages  (pages.edit)
      /media              MediaScreen          @inithium/cms-media  (assets.upload)
      /users              UsersScreen          @inithium/cms-users  (users.view)
      /settings           SettingsScreen       @inithium/cms-settings  (settings.edit)
      /pages/:id/content  ContentEditorScreen  @inithium/cms-content-editor  (pages.edit; no sidebar entry, fills the frame)
  CmsTheme                the client's theme   @inithium/cms-shell
  CmsAlerts               the AlertStack       @inithium/cms-shell
```

- **Sign-in** (`LoginPage`): the same dark backdrop, card, red alerts and field errors as `web`'s Login ([0083](../decisions/0083-let-visitors-sign-up-for-user-accounts.md)). Accounts without `cms.access` are signed back out.
- **`CmsAccessGuard`** sends signed-out visitors to `/cms/login`, then back where they were going. An account with a temporary password sees the [password change screen](../backend/authentication.md#temporary-passwords) first.
- **`CmsShell`** draws the [SidebarLayout](../ui-library/layouts/sidebar-layout.md): the site's title and the user's account menu across the top, a sidebar entry per screen down the left. It routes each screen, hiding those the user lacks the permission for. A screen marked `fill` (the content editor) gets the space under the top bar with no sidebar; the sections are then in the top bar's menu.
- **Dashboard** (`/cms`) is each user's own arrangement of widgets; see [The Dashboard](#the-dashboard).

## Adding a screen

A screen is `{ path, label, icon, element, permission?, inSidebar?, fill? }` (`CmsScreen` from `@inithium/cms-shell`). `inSidebar: false` routes it without a sidebar entry (for screens reached from another, like an editor), and `fill` gives it the whole space under the top bar. Build it in a CMS feature lib, then add it to the list in `apps/cms/src/app/app.component.tsx`:

```tsx
const screens: CmsScreen[] = [
  { path: '/', label: 'Dashboard', icon: 'layout-dashboard', element: <DashboardScreen widgets={dashboardWidgets} /> },
  { path: '/pages', label: 'Pages', icon: 'file-text', element: <PagesScreen />, permission: 'pages.edit' },
  { path: '/settings', label: 'Settings', icon: 'settings', element: <SettingsScreen />, permission: 'settings.edit' },
];
```

Plugins will add theirs through a CMS screens slot once the slot catalogue settles it (0015).

## The Dashboard

The Dashboard (`DashboardScreen`, `@inithium/cms-dashboard`) is the CMS's landing screen. Every CMS user arranges their own from **widgets** ([0120](../decisions/0120-give-each-cms-user-a-dashboard-of-widgets.md)):

- **Widgets sit in a wrapping row**, each a quarter, a third, two thirds, three quarters or the full width of it (each widget allows its own set). Each is half the screen under the top bar tall, at least 300px, so two rows show above the fold and four quarter-width widgets fill a row (as do a quarter and three quarters, or a third and two thirds). On a narrower dashboard quarters and thirds become halves, and two thirds and three quarters full width; on a narrow one every widget is full width.
- **The default dashboard** is core's: the **Setup checklist** (a third) then the **Members** graph (two thirds), filling the first row, with the add tile below them. Each is shown only to users with its permission. Nothing is stored until the user changes something; from then on their own list is kept (see [The CMS dashboard](../backend/dashboard.md)). Plugins never add to anyone's dashboard.
- **The add tile** always takes the next slot: a third-width tile with a dashed border, a darker background and a plus. It opens the **Add a widget** picker: a search box (Enter adds the first match) and a card for every widget the user may add, core's and installed plugins'. The same widget can be added more than once, e.g. two Members charts over different ranges. A new widget goes at the end, at its default width.
- **Each widget's header** has its icon and title, **← →** buttons that swap it with the widget before or after it, and a **⋯** menu with its widths and **Remove**. There's no edit mode: every change saves at once, and the dashboard goes back (with a red alert) if saving fails.
- **A widget's own controls** sit in its body and save into its settings, e.g. the Members range.
- **A widget the CMS no longer knows** (its plugin removed or inactive) or that the user lost the permission for isn't drawn, but stays in their stored list. A widget that throws shows a message inside its own card.
- Deleting an account deletes its dashboard.

### Core's widgets

| Widget | Type | Permission | Widths | What it shows |
| --- | --- | --- | --- | --- |
| **Members** | `member-growth` | `users.view` | 1/3, 2/3, 3/4, full | The number of members (`user` accounts; staff left out), how many joined in the range, and the running total as a line [Chart](../ui-library/composites/chart.md). The range is a Select in the widget: past week, month, quarter, 6 months, year, or all time. Days are the viewer's own. Deleted accounts drop out of the history. |
| **Setup checklist** | `setup-checklist` | `settings.edit` | all five | The steps a new site should take, with a progress bar. Steps detected from data (site title, logo, dark mode logo or dark mode off, favicon, brand colours, fonts, copyright holder) tick themselves, and Inithium's defaults (the "Inithium" title and copyright holder, the bundled favicon) don't count; the rest (review the privacy policy, design the Home page) are checkboxes, ticked for the whole site. The arrow beside a step opens the screen where it's done. It stays when everything's done, since steps will be added. |

### Adding a widget

A widget is a `DashboardWidgetDefinition`:

```tsx
import { z } from 'zod';
import { defineDashboardWidget, type DashboardWidgetProps } from '@inithium/cms-dashboard';
import { Text } from '@inithium/shared-ui-components';

const settingsSchema = z.object({ count: z.number().int().min(1).max(20) });

function RecentOrdersWidget({ settings }: DashboardWidgetProps<z.infer<typeof settingsSchema>>) {
  // Fetch from the plugin's own endpoints (which check the same permission) and draw with the UI library.
  return <Text as="p">The last {settings.count} orders</Text>;
}

export const recentOrdersWidget = defineDashboardWidget({
  type: 'plugin-shop:recent-orders',
  label: 'Recent orders',
  description: 'The latest orders, newest first.',
  icon: 'shopping-cart',
  permission: 'pages.edit',
  widths: ['1/3', '2/3', '3/4', 'full'],
  defaultWidth: '1/3',
  settingsSchema,
  defaultSettings: { count: 5 },
  component: RecentOrdersWidget,
});
```

- **`type`** is unique: core's are plain names, a plugin's `plugin-<name>:<widget>`. When the CMS starts, `checkDashboardWidgets()` refuses two widgets of one type, or a default width the widget doesn't allow.
- **The component** gets `{ settings, onSettingsChange, width }` and draws the widget's body under the header the dashboard gives it. The body scrolls if it doesn't fit. The component may be `React.lazy`; it loads behind a Loader and fails inside its card.
- **`settings`** are checked against `settingsSchema` and replaced by `defaultSettings` if they don't fit (e.g. after the widget changes shape). Stored settings are at most 4,000 characters of JSON.
- **Where it's listed:** core's widgets are in `coreDashboardWidgets`, which `apps/cms/src/app/app.component.tsx` lists first. Plugins and `libs/client/` add theirs to `registeredDashboardWidgets` in the CMS's registry (`apps/cms/src/app/plugins.registry.ts`), which core ships empty. A plugin widget whose data needs the plugin's own api routes waits for the API routes slot ([0015](../decisions/0015-slot-catalogue.md)).

## The Pages screen

`PagesScreen` (`@inithium/cms-pages`) lists every [page record](pages-and-routing.md#page-records):

- search by title or path, and sort by title, path or status;
- a "Site page" badge on protected pages, and each page's path, layout and status, and who has it open in the page builder, if anyone, kept current live (`useLivePageEditing()`, [one editor at a time](content-pages.md#one-editor-at-a-time), [0122](../decisions/0122-ask-the-person-editing-a-page-to-make-way.md));
- **View on the site** for published pages without parameters. It opens the path on the CMS's origin, which is the site in production; under `nx serve cms` it lands on the CMS dev server.
- **Edit content** (content pages) opens the full-screen [page builder](content-pages.md#editing) at `/pages/:id/content`, outside the sidebar frame.
- **Settings** opens the page editor.
- **New page** (with `pages.create`) opens a dialog with:
  - the template (the reusable ones; today "Content page", with its description);
  - a title;
  - an address, suggested from the title until you edit it;
  - a layout, from the template's.

  The page is created unpublished and out of menus, and opens straight away: content pages in the page builder, others in the page settings dialog ([Creating pages](../backend/pages.md#creating-pages)).
- **Duplicate** (with `pages.create`, on pages made from a reusable template) opens the same dialog with "(copy)" titles and addresses.
- **Delete** (with `pages.delete`, on pages that aren't protected) asks first, since it can't be undone, and lists the content pages that link to it (their links then show as plain text).

Problems in these dialogs show like every form's: a red alert, each field's reason, and the first field focused. A taken address marks the Address field.

The editor is a Modal over a draft, with five tabs:

| Tab | Fields |
| --- | --- |
| General | Title; path (read-only, "set by the developer" on protected pages); layout, from the page's allowed layouts; Published, which needs `pages.publish` (disabled with a tooltip otherwise) |
| Appearance | Custom background and text colour (off = the template's or site's default); entrance and exit animation, name and speed |
| Access | Who can view it: everyone, signed-out visitors only, signed-in users only |
| Navigation | The four menus (disabled, with the reason, where a parameterised page can't appear); label, order, icon ([IconPicker](../ui-library/composites/icon-picker.md)) and group |
| SEO | Search title (70 characters) and description (160), with counters |

**Save** checks the draft with `pageUpdateSchema`:
- **Problems:** a red alert, each field's reason, and the first problem's tab and field focused.
- **Success:** a green "Page saved", and the list updates.

**Cancel** discards the draft. Switching a colour or the animation back to default sends `null`, which clears it ([Pages API](../backend/pages.md#edit-rules)).

## Media

`MediaScreen` (`@inithium/cms-media`, needs `assets.upload`) is the library of uploaded files ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md), [Assets](../backend/assets.md)):

- **Storage meter:** in `database` mode, how much of the quota is used (red from 90%).
- **Search and filter:** words in the file name or description, and a kind (images, font families, documents, audio, video). **Member uploads** shows members' avatars and banners instead, which are otherwise kept apart from the site's files; owners and admins can delete one, and that profile goes back to its generated picture ([0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)).
- **Grid:** a card per file with its preview (or kind icon), name, size and dimensions. Clicking anywhere on a card opens its details modal (in the picker, picks it). Font files in a family are listed under the family, not here, unless you search.
- **Font families** ([0111](../decisions/0111-keep-uploaded-font-families-in-a-library.md), [Assets](../backend/assets.md#font-families)): the font library. It shows a card per family, drawn in its own font, with what its files cover; how many of the six are used; **New font family** (disabled when full); and the fonts not in a family. A card opens `FontFamilyDialog`:
  - **Files:** a row per file, previewed in it, with its weight and style (read from the file) and **Remove**.
  - **Upload font files:** several at once, after ticking the licence box.
  - **Uploaded fonts not in a family:** a button for each, to add it.
  - A file covering a weight and style already in the list isn't added, and an alert says why.
  - **Name** (suggested from the first file's own family name) and **Fallback** (sans serif, serif or monospace).
  - **Save** or **Add family**, Cancel, and **Remove family**. It's confirmed in the footer, which lists the pages that use the family (their text falls back to the body font). The files stay in Media, and removal is refused while it's a theme font.
- A family the theme uses says so on its card ("The site's display font").
- **Upload** opens `UploadDialog` (`@inithium/shared-media`): choose what the file is for, choose or drop a file, then for PNG, JPEG, WebP and AVIF images choose a shape and **crop to fill** or **fit inside** (on a background colour) with the [ImageCropper](../ui-library/composites/image-cropper.md), describe it, and for fonts confirm the licence. The new file opens in the details modal.
- **Details modal:** a preview (audio and video play; fonts draw a sample) beside the name and default description to edit, its type, size, dimensions (fonts: their family name, weight and style), date and storage, and **where it's used**. The footer holds **Save** (enabled once something changed), **Copy address**, **Open** and **Delete** (needs `assets.delete`; disabled while the file is the site logo or favicon, with a note saying to choose another in Settings first). Delete asks for confirmation in the footer, listing how many places will show a missing image.

Other screens use the library through two components:

- **`AssetPicker`**: a Modal with the library's grid (filtered by `kind`, or by `purpose` with `onlyPurpose`), search and **Upload new**, which uploads in place (with `purpose`) and picks the result.
- **`FontField`** ([0111](../decisions/0111-keep-uploaded-font-families-in-a-library.md)): a form field holding one font, a [FontPicker](../ui-library/composites/font-picker.md) offering the theme's roles and every library family with files, each drawn in its own font. Pass `roles={false}` or an `emptyLabel` as on FontPicker. Settings' theme fonts and the content editor's text style use it.
- **`AssetField`**: a form field showing the chosen file's thumbnail, name and size, with Choose/Change (opening the picker) and Remove (hidden when `required`). It hands back the whole asset, so a form can copy its default description. `onlyPurpose` makes its picker list only files uploaded for its `purpose`. The Settings logo and favicon and the content editor's Image block use it.

## Users

`UsersScreen` (`@inithium/cms-users`, needs `users.view`) manages accounts ([0100](../decisions/0100-manage-accounts-from-the-cms.md), [User management](../backend/user-management.md)):

- **List:** every account the viewer may see (dev accounts only for dev), 25 a page from the server, newest first, with [Pagination](../ui-library/composites/pagination.md). Each row shows the avatar with its live [status light](../backend/presence.md) ([0124](../decisions/0124-show-who-is-online-with-a-status-light-on-avatars.md); also in the details dialog), name, email, role, a **Temporary password** badge until they've chosen their own, and when they joined.
- **Search and filter:** every word in the name or email, and a role.
- **New account** (`users.create`) opens `NewUserDialog`: first and last name, email and a role from those the viewer may give (editors: Editor and Member). The account signs in with the site's temporary password. With no `USER_TEMP_PASSWORD` set, the button is disabled and an alert explains why.
- **Details:** clicking a row opens `UserDetails`, a Modal with the avatar, the names and role, and the account's details. Its footer holds **Save**, **View profile**, **Reset password** and **Delete**, as the viewer is allowed. Reset and Delete confirm in the footer. Your own account shows only Save and View profile, with the role locked. Editors see a read-only view.
- **Bulk delete** (`users.delete`): a checkbox on each row and **Select this page** above the list. Accounts you can't delete (yourself, more senior roles) have their checkbox disabled, with a tooltip saying why. Selections carry across pages. **Delete N** opens `DeleteUsersDialog`, which names them (the first 10, then "and N more"). Afterwards an alert reports how many were deleted, and another lists any refused with their reasons.

## The Settings screen

`SettingsScreen` (`@inithium/cms-settings`) edits the [site settings](../backend/site-settings.md) ([0087](../decisions/0087-set-theme-colours-in-cms-settings.md)):

- **Site:** the title (Navbar, Footer and browser tabs; default "Inithium"), the logo (an [`AssetField`](#media): choose an image from the Media library or upload one, cropped or fitted) and its description, with a preview on light mode's background (Inithium's logo when none is set), the **dark mode logo** and its description, previewed on dark mode's background (the logo, or Inithium's dark logo, when none is set; [0119](../decisions/0119-let-each-user-choose-light-or-dark-mode.md)), the favicon (an `AssetField` listing only favicon uploads: ICO, PNG or SVG, previewed at 16 and 32 px, [0101](../decisions/0101-set-the-favicon-from-an-uploaded-asset.md)), and the copyright holder.
- **Theme fonts** ([0111](../decisions/0111-keep-uploaded-font-families-in-a-library.md)): `ThemeFontField`, a `FontField` per role (**Display font**, **Body font**) offering **Inithium's default** and every family in the font library that has files, each drawn in its own font, with a sample drawn in the choice below it. The body font's note says it's used for all running text, so it should be easy to read.
- **Dark mode** ([0119](../decisions/0119-let-each-user-choose-light-or-dark-mode.md)): **Offer dark mode**, a Switch saving `darkMode`. Off, everyone sees light mode and the profile's Settings tab hides the choice; people's choices are kept. See [Dark mode](../ui-library/theme/dark-mode.md).
- **Theme colours:** six hex fields, the 500 of `primary`, `secondary`, `tertiary`, `quaternary` and `accent` and the 100 of `surface`. Each has a swatch and a live row of its generated 50–950 scale, the client's own step outlined. The row shows each step as the current mode draws it: in [dark mode](../ui-library/theme/dark-mode.md) every slot holds its mirrored colour (so surface's outlined 100 is the generated 900), with a note saying where the client's colour sits. A surface too dark for readable text shows why on the field instead of a preview, and Save refuses it. **Reset to defaults** restores core's colours; saved, it removes the stored theme.

Saving updates the CMS at once: `CmsTheme` renders the client's theme and fonts (`ThemeStyles`, `ThemeFonts`) at the app's root from the site bundle, which a save refreshes. It also applies the signed-in user's light or dark mode (`useColorScheme()`), so the CMS follows the same preference as `web`. `web` visitors see changes on their next full page load.

## Forms

CMS and `web` forms share the same helpers from `@inithium/shared-data-access`:
- `fieldErrorsFrom()` turns validation issues into per-field messages, keyed by dotted path such as `seo.title`;
- `readApiFailure()` reads an API error's status, message, issues and field;
- `focusFirstError()` focuses the first failing field by its `name`.

Show problems with `useAlerts().show()` in red, as [Sign-up](../backend/authentication.md#sign-up-and-the-password-policy) does. Alerts appear in the bottom-right corner, so keep a form's buttons out of it: put Save on the left, under the fields.
