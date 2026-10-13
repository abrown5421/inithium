---
title: Core libs
description: The libs core ships, what each owns, and how to create a new one.
scope: core
tags: [nx, libs]
order: 3
decisions: ["0007", "0009", "0010", "0020", "0022"]
---

# Core libs

Apps are thin orchestrators. Business logic lives in libs, one lib per concern. Core libs live in `core/libs/<scope>/<name>/` with the alias `@inithium/<scope>-<name>`. Next to them are `libs/plugins/` (installed plugins) and `libs/client/` (client-only code, never used by core).

## Current libs

| Lib | Path | Tags | Exports |
| --- | --- | --- | --- |
| `@inithium/api-config` | `libs/api/config` | `scope:api`, `type:util`, `origin:core` | `loadEnv()`, `envSchema`, `Env` |
| `@inithium/api-database` | `libs/api/database` | `scope:api`, `type:data-access`, `origin:core` | `connectDatabase(uri)`, `disconnectDatabase()`, `isDatabaseConnected()`, `healthRouter` |
| `@inithium/api-users` | `libs/api/users` | `scope:api`, `type:data-access`, `origin:core` | `UserModel`, `toUser()`, `toPublicProfile()`, user queries, `createUser()`, `updateUserProfile()`, `backfillUserProfiles()`, `createProfileAvatar()`, `createProfileBanner()` |
| `@inithium/api-auth` | `libs/api/auth` | `scope:api`, `type:feature`, `origin:core` | `authRouter`, `requireAuth`, `requireSession`, `requirePermission()`, `getAuth()`, `seedDevUser()` |
| `@inithium/api-pages` | `libs/api/pages` | `scope:api`, `type:feature`, `origin:core` | `PageModel`, `pagesRouter`, `siteRouter`, page service functions, `seedPages()`, `seedCorePages()` |
| `@inithium/api-profiles` | `libs/api/profiles` | `scope:api`, `type:feature`, `origin:core` | `profilesRouter` |
| `@inithium/api-settings` | `libs/api/settings` | `scope:api`, `type:feature`, `origin:core` | `SettingsModel`, `settingsRouter`, `getSiteSettings()`, `updateSiteSettings()`, `seedSiteSettings()` |
| `@inithium/shared-contracts` | `libs/shared/contracts` | `scope:shared`, `type:util`, `origin:core` | Zod schemas and inferred types: users, roles, auth, permissions, pages, site settings, theme, UI style props, animation |
| `@inithium/shared-ui-theme` | `libs/shared/ui-theme` | `scope:shared`, `type:ui`, `origin:core`, `ui:theme` | `defaultTheme`, `defaultLogo`, scale generation, `themeColorProblem()`, `ThemeStyles`, theme fonts CSS |
| `@inithium/shared-ui-components` | `libs/shared/ui-components` | `scope:shared`, `type:ui`, `origin:core`, `ui:component` | `Button`, `Checkbox`, `Container`, `Divider`, `Icon`, `Input`, `InputAdornment`, `Loader`, `RadioGroup`, `Select`, `Slider`, `Switch`, `Text`, `Tooltip`, `UiProvider`, `useAnimation`, `toCssColor()` |
| `@inithium/shared-ui-composites` | `libs/shared/ui-composites` | `scope:shared`, `type:ui`, `origin:core`, `ui:composite` | `Alert`, `AlertStack`, `AutoIncrementingList`, `Avatar`, `Breadcrumbs`, `ColorPicker`, `Drawer`, `Footer`, `IconPicker`, `Modal`, `Navbar`, `Pagination`, `PolyBanner`, `Tabs` |
| `@inithium/shared-permissions` | `libs/shared/permissions` | `scope:shared`, `type:util`, `origin:core` | `rolePermissions`, `hasPermission()` |
| `@inithium/shared-ui-layouts` | `libs/shared/ui-layouts` | `scope:shared`, `type:ui`, `origin:core`, `ui:layout` | `BareLayout`, `DefaultLayout`, `FullWidthLayout`, `ProfileLayout`, `SidebarLayout`, `NAVBAR_HEIGHT_VAR` |
| `@inithium/shared-content` | `libs/shared/content` | `scope:shared`, `type:feature`, `origin:core` | `ContentRenderer`, `ContentSectionView`, `ContentBlockView`, `RichText`, `ContentLinksProvider`, `useContentLinks()`, `ContentDecoratorsProvider`, `useContentDecorators()` |
| `@inithium/cms-content-editor` | `libs/cms/content-editor` | `scope:cms`, `type:feature`, `origin:core` | `ContentEditorScreen`, `ContentEditor`, `PreviewFrame`, `RichTextEditor`, `RichTextToolbar`, the document operations and hooks |
| `@inithium/shared-auth-ui` | `libs/shared/auth-ui` | `scope:shared`, `type:feature`, `origin:core` | `PasswordChangeScreen`, `PasswordChangeForm` |
| `@inithium/web-shell` | `libs/web/shell` | `scope:web`, `type:feature`, `origin:core` | `SiteShell`, `PageTemplate`, `PageTemplateProps`, `usePageReady()`, `useSite()`, `buildMenus()`, `resolvePage()` |
| `@inithium/web-pages` | `libs/web/pages` | `scope:web`, `type:feature`, `origin:core` | `coreTemplates`, `HomePage`, `LoginPage`, `NotFoundPage`, `ProfilePage`, `SignUpPage`, the profile slot types, `ProfileSlotsProvider`, `profileCard` |
| `@inithium/shared-data-access` | `libs/shared/data-access` | `scope:shared`, `type:data-access`, `origin:core` | `baseApi`, auth hooks (including `useRegisterMutation()` and `useChangePasswordMutation()`), `useGetSiteQuery()`, page hooks (`useGetPagesQuery()`, `useGetPageQuery()`, `useUpdatePageMutation()`, `useDeletePageMutation()`, `useSaveContentDraftMutation()`, `usePublishContentMutation()`, `useDiscardContentDraftMutation()`, `useGetPageTemplatesQuery()`, `useCreatePageMutation()`, `useDuplicatePageMutation()`), settings hooks (`useGetSettingsQuery()`, `useUpdateSettingsMutation()`), profile hooks (`useGetProfileQuery()`, `useUpdateMyProfileMutation()`), the form helpers `fieldErrorsFrom()`, `readApiFailure()` and `focusFirstError()`, `createAppStore()`, `getApiErrorMessage()`, the `modals` slice (`openModal`, `closeModal`) and `useModal()`, the `alerts` slice (`showAlert`, `dismissAlert`) and `useAlerts()` |
| `@inithium/cms-auth` | `libs/cms/auth` | `scope:cms`, `type:feature`, `origin:core` | `LoginPage`, `CmsAccessGuard` |
| `@inithium/cms-shell` | `libs/cms/shell` | `scope:cms`, `type:feature`, `origin:core` | `CmsShell`, `CmsScreen`, `DashboardPage`, `CmsAlerts`, `CmsTheme` |
| `@inithium/cms-pages` | `libs/cms/pages` | `scope:cms`, `type:feature`, `origin:core` | `PagesScreen`, `PageEditor` |
| `@inithium/cms-settings` | `libs/cms/settings` | `scope:cms`, `type:feature`, `origin:core` | `SettingsScreen`, `ThemeColorField`, `normalizeHex()` |

### `@inithium/api-config`

The only code that reads `process.env`. `loadEnv()` validates the environment once against `envSchema`, caches the result and returns it typed as `Env`. It throws a readable error listing every invalid variable. See [Environment variables](../backend/environment-variables.md).

### `@inithium/api-database`

Owns the Mongoose connection.

- `connectDatabase(uri)` connects with a 10-second server-selection timeout and logs the database name, never the URI. Error and disconnect listeners are attached only after the first connection succeeds, so a failed startup reports a single error.
- `disconnectDatabase()` removes the disconnect listener and closes the connection.

The api calls `connectDatabase` before it listens and `disconnectDatabase` on SIGTERM or SIGINT. `isDatabaseConnected()` and `healthRouter` (mounted at `/api/health`) report the connection for Render's health check.

### `@inithium/api-users`

The `users` collection. `UserModel` stores `email` (unique, lowercased), `passwordHash` (excluded from queries unless selected with `+passwordHash`), `role` (default `user`) and `passwordChangeRequired`, with timestamps, and the `profile` (names, bio, avatar and banner recipes). `toUser()` maps a stored user to the API's `User` shape and `toPublicProfile()` to a `PublicProfile`. Also exports `findUserById()`, `findUserByIdWithPassword()`, `findUserByEmailWithPassword()`, `userExistsWithEmail()`, `userExistsWithRole()`, `createUser()` (always with a generated avatar and banner), `updateUserProfile()`, `backfillUserProfiles()` (run on every start) and the generators `createProfileAvatar()` and `createProfileBanner()`. See [Users](../backend/users.md) and [Profiles](../backend/profiles.md).

### `@inithium/api-auth`

Authentication for the API: the `/api/auth` routes, the `requireAuth` / `requirePermission()` / `requireSession` middleware, `getAuth()` for reading the signed-in user inside a protected route, `readAuth(req)` for reading an optional session on a public route, and `seedDevUser()`, which the api calls after connecting. Internally it owns password hashing (`scrypt`), access tokens, the `refreshtokens` collection and the auth cookies. See [Authentication](../backend/authentication.md).

### `@inithium/api-pages`

The `pages` collection ([0078](../decisions/0078-store-pages-as-records-rendered-by-code-templates.md)): `PageModel`, `toPage()` / `toPublicPage()`, `listPages()`, `listPublishedPages()`, `findPageById()`, `createPage()`, `duplicatePage()`, `updatePage()` (the edit rules), `deletePage()`, `saveContentDraft()`, `publishContent()` and `discardContentDraft()`; `reusableTemplates` / `listReusableTemplates()`; `pagesRouter` (`/api/pages`) and `siteRouter` (`/api/site`); and `seedPages()` / `seedCorePages()` / `corePageSeeds` (with `seedKey`s for content pages) and `privacyPolicyContent()`. See [Pages](../backend/pages.md).

### `@inithium/api-profiles`

The profile API ([0090](../decisions/0090-generate-and-show-user-profiles.md)): `profilesRouter`, mounted at `/api/profiles` (`GET /:id`, `PATCH /me`). The data and its service functions are in `@inithium/api-users`. See [Profiles](../backend/profiles.md).

### `@inithium/api-settings`

The one site settings record ([0082](../decisions/0082-keep-site-wide-settings-in-one-record.md)): `SettingsModel`, `toSiteSettings()`, `getSiteSettings()`, `updateSiteSettings()`, `DEFAULT_SITE_SETTINGS`, `settingsRouter` (`/api/settings`) and `seedSiteSettings()`. See [Site settings](../backend/site-settings.md).

### `@inithium/shared-contracts`

The Zod schemas shared by the api and both frontends, with inferred types: `roles` / `roleSchema` / `Role`, `userSchema` / `User`, `loginRequestSchema` / `LoginRequest`, `registerRequestSchema` / `RegisterRequest`, `emailSchema`, `newPasswordSchema` (with `passwordPolicy` and `passwordPolicyHint`), `userProfileSchema` / `UserProfile`, `profileLimits`, `profileName()`, `userDisplayName()`, the profile contracts (`publicProfileSchema` / `PublicProfile`, `updateProfileRequestSchema` / `UpdateProfileRequest`, `profileViewers` / `ProfileViewer`, `publicProfileName()`), `authResponseSchema` / `AuthResponse`, `permissions` / `permissionSchema` / `Permission`, the page contracts (`pageSchema` / `Page`, `publicPageSchema` / `PublicPage`, `pageUpdateSchema`, `pageNavigationSchema`, `pagePathSchema`, `pageAudiences`, `navLocations`, `navigationAllowed()`, `pathHasParams()`) and the site settings contracts (`siteSettingsSchema` / `SiteSettings`, `siteSettingsInputSchema`, `siteBundleSchema` / `SiteBundle`).

### `@inithium/shared-ui-theme`, `@inithium/shared-ui-components`, `@inithium/shared-ui-composites` and `@inithium/shared-ui-layouts`

The four layers of the UI library. See the [UI library](../ui-library/index.md) section, with a page per component.

### `@inithium/shared-content`

Draws content pages ([0093](../decisions/0093-build-content-pages-from-sections-columns-and-blocks.md)): `ContentRenderer` (a content document's sections, columns and blocks), with `RichText` for rich text documents. Links resolve through the `links` prop (`pagePath`, `onNavigate`). Used by `web`'s `content` template and, later, the CMS editor's preview. See [Content pages](../architecture/content-pages.md).

### `@inithium/cms-content-editor`

The CMS's full-screen content page editor ([0094](../decisions/0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md)): `ContentEditorScreen` (the `/pages/:id/content` route), `ContentEditor`, the iframe `PreviewFrame`, the TipTap `RichTextEditor` and `RichTextToolbar` with `richTextToTiptap()` / `tiptapToRichText()`, the structure and properties panels, the pure document operations (`content-document.service.ts`) and the `useContentHistory()` / `useAutosave()` hooks. See [Content pages](../architecture/content-pages.md#editing).

### `@inithium/shared-auth-ui`

Auth screens shared by `web` and the CMS: `PasswordChangeScreen`, shown to accounts that must change a temporary password ([0088](../decisions/0088-make-temporary-passwords-change-on-first-sign-in.md)), and the `PasswordChangeForm` inside it, which the profile's Account tab also uses.

### `@inithium/web-shell`

`web`'s page system ([0079](../decisions/0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)): `SiteShell` (render it inside a router and the Redux store, with every template), the template contract `PageTemplate` / `PageTemplateProps`, `usePageReady()`, `useSite()`, and the pure `buildMenus()`, `resolvePage()` and `audienceRedirect()`. See [Pages and routing](../architecture/pages-and-routing.md).

### `@inithium/web-pages`

Core's page templates, `coreTemplates`: Home, Profile, Login, Sign up and Not Found, matching the pages the api seeds. Login and Sign up are real forms with a red AlertStack alert and per-field errors ([0083](../decisions/0083-let-visitors-sign-up-for-user-accounts.md)). `ContentPage` is the reusable `content` template ([Content pages](../architecture/content-pages.md)). Profile is the real profile page with its About and Account tabs; the profile slot types (`ProfileSlots`, `ProfileTab`, `ProfileSidebarSection`, `ProfileHeaderAction`, `ProfileSlotProps`) and `ProfileSlotsProvider` let the web registry add to it ([Profiles](../backend/profiles.md)).

### `@inithium/shared-permissions`

The permission matrix (`rolePermissions`) and `hasPermission(role, permission)`. `dev` holds every permission.

### `@inithium/shared-data-access`

The frontends' RTK Query layer. `baseApi` calls `/api` and, on a `401`, refreshes the session once and retries. Features add endpoints with `baseApi.injectEndpoints()`. Also exports the auth endpoints (`useGetCurrentUserQuery`, `useLoginMutation`, `useLogoutMutation`), `createAppStore()` for an app's root `<Provider>`, `getApiErrorMessage()`, and the global modal state: the `modals` slice (`openModal(id)`, `closeModal(id?)`, `selectOpenModalId`) and `useModal(id)` ([Modal](../ui-library/composites/modal.md)); and the global alert queue: the `alerts` slice (`showAlert(content)`, `dismissAlert(id)`, `removeAlert(id)`, `selectAlerts`) and `useAlerts()` ([AlertStack](../ui-library/composites/alert-stack.md)).

### `@inithium/cms-auth`

CMS sign-in: `LoginPage` (route `/login`, the same card and form errors as `web`'s Login) and `CmsAccessGuard` (wrap any route that needs CMS access).

### `@inithium/cms-shell`

The signed-in CMS ([0086](../decisions/0086-run-the-cms-in-a-sidebar-frame-with-a-pages-screen.md)): `CmsShell` (the SidebarLayout frame, routing a list of `CmsScreen`s and hiding those the user can't use), `DashboardPage`, `CmsAlerts` (the app's AlertStack) and `CmsTheme` (the client's theme over the default). See [The CMS](../architecture/cms.md).

### `@inithium/cms-pages`

The Pages screen: `PagesScreen` (search, sort and rows) and `PageEditor` (the tabbed edit dialog).

### `@inithium/cms-settings`

The Settings screen ([0087](../decisions/0087-set-theme-colours-in-cms-settings.md)): `SettingsScreen` (site details and theme colours) and `ThemeColorField` (a hex field with its generated scale).

## Creating a lib

Libs are non-buildable source libs; the consuming app compiles them. From `core/`:

```sh
npx nx g @nx/node:library --directory=libs/<scope>/<name> --name=<scope>-<name> \
  --importPath=@inithium/<scope>-<name> --tags=scope:<scope>,type:<type>,origin:core \
  --buildable=false --unitTestRunner=none --linter=eslint --strict --useProjectJson --no-interactive
```

For React libs, use `@nx/react:library` with `--bundler=none --style=none --component=false` instead of `--buildable=false --strict`. Then:

1. Delete the generated placeholder file and README, and a React lib's `.babelrc` (unused, because Vite compiles the lib as part of the app).
2. Check the lib has an `eslint.config.mjs` that spreads the root config.
   - Tailwind classes in libs are picked up because each app's `styles.css` contains `@source "../../../libs";`. Without that line, Tailwind only scans the app's own folder.
3. Add the lib to the table above.

Tags and the boundary rules they enforce are listed in [Conventions](conventions.md#tags-and-module-boundaries).
