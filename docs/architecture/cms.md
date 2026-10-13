---
title: The CMS
description: How the CMS app is put together - its frame, screens, sign-in and the Pages editor - and how to add a screen.
scope: core
tags: [cms, architecture, permissions]
order: 6
decisions: ["0083", "0086", "0087"]
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

## The Settings screen

`SettingsScreen` (`@inithium/cms-settings`) edits the [site settings](../backend/site-settings.md) ([0087](../decisions/0087-set-theme-colours-in-cms-settings.md)):

- **Site:** the title (Navbar, Footer and browser tabs; default "Inithium"), the logo's address and description, with a preview (Inithium's logo when none is set), and the copyright holder.
- **Theme colours:** six hex fields, the 500 of `primary`, `secondary`, `tertiary`, `quaternary` and `accent` and the 100 of `surface`. Each has a swatch and a live row of its generated 50–950 scale, the client's own step outlined. A surface too dark for readable text shows why on the field instead of a preview, and Save refuses it. **Reset to defaults** restores core's colours; saved, it removes the stored theme.

Saving updates the CMS at once: `CmsTheme` renders the client's theme at the app's root from the site bundle, which a save refreshes. `web` visitors see changes on their next full page load.

## Forms

CMS and `web` forms share the same helpers from `@inithium/shared-data-access`:
- `fieldErrorsFrom()` turns validation issues into per-field messages, keyed by dotted path such as `seo.title`;
- `readApiFailure()` reads an API error's status, message, issues and field;
- `focusFirstError()` focuses the first failing field by its `name`.

Show problems with `useAlerts().show()` in red, as [Sign-up](../backend/authentication.md#sign-up-and-the-password-policy) does. Alerts appear in the bottom-right corner, so keep a form's buttons out of it: put Save on the left, under the fields.
