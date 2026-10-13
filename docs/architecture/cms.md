---
title: The CMS
description: How the CMS app is put together - its frame, screens, sign-in, the Pages editor, the Media library and the Users screen - and how to add a screen.
scope: core
tags: [cms, architecture, permissions]
order: 6
decisions: ["0083", "0086", "0087", "0098", "0099", "0100"]
---

# The CMS

The CMS (`apps/cms`, served at `/cms`) is the client portal, where owners, admins and editors manage the site ([0086](../decisions/0086-run-the-cms-in-a-sidebar-frame-with-a-pages-screen.md)). It's a separate app from `web` with its own plain routes, and like every app it only composes libs.

## How it fits together

```
apps/cms   App: the routes and the list of screens
  /login                  LoginPage           @inithium/cms-auth
  everything else         CmsAccessGuard      @inithium/cms-auth   (signed in with cms.access)
    CmsShell              SidebarLayout frame  @inithium/cms-shell
      /                   DashboardPage        @inithium/cms-shell
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
- **Dashboard** (`/cms`) is empty for now apart from a welcome. It will later show different things to different roles.

## Adding a screen

A screen is `{ path, label, icon, element, permission?, inSidebar?, fill? }` (`CmsScreen` from `@inithium/cms-shell`). `inSidebar: false` routes it without a sidebar entry (for screens reached from another, like an editor), and `fill` gives it the whole space under the top bar. Build it in a CMS feature lib, then add it to the list in `apps/cms/src/app/app.component.tsx`:

```tsx
const screens: CmsScreen[] = [
  { path: '/', label: 'Dashboard', icon: 'layout-dashboard', element: <DashboardPage /> },
  { path: '/pages', label: 'Pages', icon: 'file-text', element: <PagesScreen />, permission: 'pages.edit' },
  { path: '/settings', label: 'Settings', icon: 'settings', element: <SettingsScreen />, permission: 'settings.edit' },
];
```

Plugins will add theirs through a CMS screens slot once the slot catalogue settles it (0015).

## The Pages screen

`PagesScreen` (`@inithium/cms-pages`) lists every [page record](pages-and-routing.md#page-records):

- search by title or path, and sort by title, path or status;
- a "Site page" badge on protected pages, and each page's path, layout and status;
- **View on the site** for published pages without parameters. It opens the path on the CMS's origin, which is the site in production; under `nx serve cms` it lands on the CMS dev server.
- **Edit content** (content pages) opens the full-screen [content editor](content-pages.md#editing) at `/pages/:id/content`, outside the sidebar frame.
- **Settings** opens the page editor.
- **New page** (with `pages.create`) opens a dialog with:
  - the template (the reusable ones; today "Content page", with its description);
  - a title;
  - an address, suggested from the title until you edit it;
  - a layout, from the template's.

  The page is created unpublished and out of menus, and opens straight away: content pages in the content editor, others in the page editor ([Creating pages](../backend/pages.md#creating-pages)).
- **Duplicate** (with `pages.create`, on pages made from a reusable template) opens the same dialog with "(copy)" titles and addresses.
- **Delete** (with `pages.delete`, on pages that aren't protected) asks first, since it can't be undone.

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
- **Search and filter:** words in the file name or description, and a kind (images, fonts, documents, audio, video). **Member uploads** shows members' avatars and banners instead, which are otherwise kept apart from the site's files; owners and admins can delete one, and that profile goes back to its generated picture ([0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)).
- **Grid:** a card per file with its preview (or kind icon), name, size and dimensions. Clicking anywhere on a card opens its details modal (in the picker, picks it).
- **Upload** opens `UploadDialog` (`@inithium/shared-media`): choose what the file is for, choose or drop a file, then for PNG, JPEG, WebP and AVIF images choose a shape and **crop to fill** or **fit inside** (on a background colour) with the [ImageCropper](../ui-library/composites/image-cropper.md), describe it, and for fonts confirm the licence. The new file opens in the details modal.
- **Details modal:** a preview (audio and video play) beside the name and default description to edit, its type, size, dimensions, date and storage, and **where it's used**. The footer holds **Save** (enabled once something changed), **Copy address**, **Open** and **Delete** (needs `assets.delete`; disabled while the file is the site logo, with a note saying to choose another logo first). Delete asks for confirmation in the footer, listing how many places will show a missing image.

Other screens use the library through two components:

- **`AssetPicker`**: a Modal with the library's grid (filtered by `kind`), search and **Upload new**, which uploads in place (with `purpose`) and picks the result.
- **`AssetField`**: a form field showing the chosen file's thumbnail, name and size, with Choose/Change (opening the picker) and Remove (hidden when `required`). It hands back the whole asset, so a form can copy its default description. The Settings logo and the content editor's Image block use it.

## Users

`UsersScreen` (`@inithium/cms-users`, needs `users.view`) manages accounts ([0100](../decisions/0100-manage-accounts-from-the-cms.md), [User management](../backend/user-management.md)):

- **List:** every account the viewer may see (dev accounts only for dev), 25 a page from the server, newest first, with [Pagination](../ui-library/composites/pagination.md). Each row shows the avatar, name, email, role, a **Temporary password** badge until they've chosen their own, and when they joined.
- **Search and filter:** every word in the name or email, and a role.
- **New account** (`users.create`) opens `NewUserDialog`: first and last name, email and a role from those the viewer may give (editors: Editor and Member). The account signs in with the site's temporary password. With no `USER_TEMP_PASSWORD` set, the button is disabled and an alert explains why.
- **Details:** clicking a row opens `UserDetails`, a Modal with the avatar, the names and role, and the account's details. Its footer holds **Save**, **View profile**, **Reset password** and **Delete**, as the viewer is allowed. Reset and Delete confirm in the footer. Your own account shows only Save and View profile, with the role locked. Editors see a read-only view.
- **Bulk delete** (`users.delete`): a checkbox on each row and **Select this page** above the list. Accounts you can't delete (yourself, more senior roles) have their checkbox disabled, with a tooltip saying why. Selections carry across pages. **Delete N** opens `DeleteUsersDialog`, which names them (the first 10, then "and N more"). Afterwards an alert reports how many were deleted, and another lists any refused with their reasons.

## The Settings screen

`SettingsScreen` (`@inithium/cms-settings`) edits the [site settings](../backend/site-settings.md) ([0087](../decisions/0087-set-theme-colours-in-cms-settings.md)):

- **Site:** the title (Navbar, Footer and browser tabs; default "Inithium"), the logo (an [`AssetField`](#media): choose an image from the Media library or upload one, cropped or fitted) and its description, with a preview (Inithium's logo when none is set), and the copyright holder.
- **Theme colours:** six hex fields, the 500 of `primary`, `secondary`, `tertiary`, `quaternary` and `accent` and the 100 of `surface`. Each has a swatch and a live row of its generated 50–950 scale, the client's own step outlined. A surface too dark for readable text shows why on the field instead of a preview, and Save refuses it. **Reset to defaults** restores core's colours; saved, it removes the stored theme.

Saving updates the CMS at once: `CmsTheme` renders the client's theme at the app's root from the site bundle, which a save refreshes. `web` visitors see changes on their next full page load.

## Forms

CMS and `web` forms share the same helpers from `@inithium/shared-data-access`:
- `fieldErrorsFrom()` turns validation issues into per-field messages, keyed by dotted path such as `seo.title`;
- `readApiFailure()` reads an API error's status, message, issues and field;
- `focusFirstError()` focuses the first failing field by its `name`.

Show problems with `useAlerts().show()` in red, as [Sign-up](../backend/authentication.md#sign-up-and-the-password-policy) does. Alerts appear in the bottom-right corner, so keep a form's buttons out of it: put Save on the left, under the fields.
