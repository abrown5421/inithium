---
title: Core libs
description: The libs core ships, what each owns, and how to create a new one.
scope: core
tags: [nx, libs]
order: 3
decisions: ["0007", "0009", "0010", "0020", "0022", "0103"]
---

# Core libs

Apps are thin orchestrators. Business logic lives in libs, one lib per concern. Core libs live in `core/libs/<scope>/<name>/` with the alias `@inithium/<scope>-<name>`. Next to them are `libs/plugins/` (installed plugins) and `libs/client/` (client-only code, never used by core).

## Current libs

| Lib | Path | Tags | Exports |
| --- | --- | --- | --- |
| `@inithium/api-config` | `libs/api/config` | `scope:api`, `type:util`, `origin:core` | `loadEnv()`, `envSchema`, `Env` |
| `@inithium/api-http` | `libs/api/http` | `scope:api`, `type:util`, `origin:core` | `apiErrorHandler`, `apiNotFound`, `HttpError` |
| `@inithium/api-testing` | `libs/api/testing` | `scope:api`, `type:testing`, `origin:core` | `createTestApi()`, `TestClient`, `testClient()`, `snapshotDatabase()`, `describeChanges()`, `clearDatabase()`, `TEST_ENV`, `expectSeedIsIdempotent()`, `expectUnseedRestores()`, `expectUserDeletionHook()` |
| `@inithium/api-testing-accounts` | `libs/api/testing-accounts` | `scope:api`, `type:testing`, `origin:core` | `createTestAccount()`, `createTestApiWithAuth()`, `signIn()`, `signedInClient()`, `TEST_PASSWORD` |
| `@inithium/api-database` | `libs/api/database` | `scope:api`, `type:data-access`, `origin:core` | `connectDatabase(uri)`, `disconnectDatabase()`, `isDatabaseConnected()`, `healthRouter` |
| `@inithium/api-users` | `libs/api/users` | `scope:api`, `type:data-access`, `origin:core` | `UserModel`, `toUser()`, `toPublicProfile()`, user queries, `createUser()`, `updateUserProfile()`, `backfillUserProfiles()`, `createProfileAvatar()`, `createProfileBanner()`, `findUsersWithProfileImage()`, `clearProfileImage()`, `toManagedUser()`, `listUsers()`, `findUsersByIds()`, `countUsersWithRole()`, `deleteUserRecords()` |
| `@inithium/api-auth` | `libs/api/auth` | `scope:api`, `type:feature`, `origin:core` | `authRouter`, `requireAuth`, `requireSession`, `requirePermission()`, `getAuth()`, `readAuth()`, `seedDevUser()`, `hashPassword()`, `revokeSessions()`, `endSessionsOfDeletedUsers()` |
| `@inithium/api-pages` | `libs/api/pages` | `scope:api`, `type:feature`, `origin:core` | `PageModel`, `pagesRouter`, `siteRouter`, page service functions, `seedPages()`, `seedCorePages()` |
| `@inithium/api-profiles` | `libs/api/profiles` | `scope:api`, `type:feature`, `origin:core` | `profilesRouter` |
| `@inithium/api-user-management` | `libs/api/user-management` | `scope:api`, `type:feature`, `origin:core` | `createUsersRouter()`, `UserDeletionHook`, the user management service functions |
| `@inithium/api-fonts` | `libs/api/fonts` | `scope:api`, `type:data-access`, `origin:core` | `FontFamilyModel`, `toFontFamily()`, `listFontFamilies()`, `findFontFamily()`, `findFontFamilyWithFile()`, `removeFontFile()`, `renameFontFile()`, `toSiteFontFamily()`, `markFontsChanged()`, `fontsVersion()` |
| `@inithium/api-assets` | `libs/api/assets` | `scope:api`, `type:feature`, `origin:core` | `AssetModel`, `AssetBlobModel`, `assetsRouter`, `fontFamiliesRouter`, `readFontInfo()`, font family service functions, `startStorage()`, `storageDriver()`, `driverFor()`, `databaseDriver()`, `r2Driver()`, `processUpload()`, asset service functions (incl. `checkProfileImage()`, `releaseProfileImage()`) |
| `@inithium/api-settings` | `libs/api/settings` | `scope:api`, `type:feature`, `origin:core` | `SettingsModel`, `settingsRouter`, `getSiteSettings()`, `updateSiteSettings()`, `seedSiteSettings()`, `fontRolesUsing()`, `themeFontsHead()`, `renderAppPage()` |
| `@inithium/shared-contracts` | `libs/shared/contracts` | `scope:shared`, `type:util`, `origin:core` | Zod schemas and inferred types: users, roles, auth, permissions, pages, site settings, theme, UI style props, animation |
| `@inithium/shared-ui-theme` | `libs/shared/ui-theme` | `scope:shared`, `type:ui`, `origin:core`, `ui:theme` | `defaultTheme`, `defaultLogo`, scale generation, `themeColorProblem()`, `ThemeStyles`, `useFavicon()`, theme fonts CSS |
| `@inithium/shared-ui-components` | `libs/shared/ui-components` | `scope:shared`, `type:ui`, `origin:core`, `ui:component` | `Button`, `Checkbox`, `Container`, `Divider`, `Icon`, `Image`, `Input`, `InputAdornment`, `Loader`, `RadioGroup`, `Select`, `Slider`, `Switch`, `Text`, `Tooltip`, `UiProvider`, `useAnimation`, `toCssColor()` |
| `@inithium/shared-ui-composites` | `libs/shared/ui-composites` | `scope:shared`, `type:ui`, `origin:core`, `ui:composite` | `Alert`, `AlertStack`, `AutoIncrementingList`, `Avatar`, `Breadcrumbs`, `ColorPicker`, `Drawer`, `Footer`, `IconPicker`, `ImageCropper`, `renderCrop()`, `Modal`, `Navbar`, `Pagination`, `PolyBanner`, `RichTextField`, `RichTextView`, `resolveUrlLink()`, `richTextToTiptap()`, `tiptapToRichText()`, `Tabs` |
| `@inithium/shared-permissions` | `libs/shared/permissions` | `scope:shared`, `type:util`, `origin:core` | `rolePermissions`, `hasPermission()`, `assignableRoles()`, `canManageRole()` |
| `@inithium/shared-ui-layouts` | `libs/shared/ui-layouts` | `scope:shared`, `type:ui`, `origin:core`, `ui:layout` | `BareLayout`, `DefaultLayout`, `FullWidthLayout`, `ProfileLayout`, `SidebarLayout`, `NAVBAR_HEIGHT_VAR` |
| `@inithium/shared-media` | `libs/shared/media` | `scope:shared`, `type:feature`, `origin:core` | `UploadForm`, `UploadDialog`, `AssetThumbnail`, `formatBytes()`, `CROP_SHAPES`, `PURPOSE_LABELS`, `KIND_ICONS`, `resolveCssColor()` |
| `@inithium/shared-content` | `libs/shared/content` | `scope:shared`, `type:feature`, `origin:core` | `ContentRenderer`, `ContentElementView`, `RichText`, `ContentLinksProvider`, `useContentLinks()`, `ContentDecoratorsProvider`, `useContentDecorators()`, `withoutBoxProps()`, `ContentElementRenderer`, `ContentElementRenderersProvider` |
| `@inithium/cms-content-editor` | `libs/cms/content-editor` | `scope:cms`, `type:feature`, `origin:core` | `ContentEditorScreen`, `PageBuilder`, `LayersPanel`, `ElementProperties`, `PreviewFrame`, `RichTextEditor`, `RichTextToolbar`, the tree operations and hooks |
| `@inithium/shared-auth-ui` | `libs/shared/auth-ui` | `scope:shared`, `type:feature`, `origin:core` | `PasswordChangeScreen`, `PasswordChangeForm` |
| `@inithium/web-shell` | `libs/web/shell` | `scope:web`, `type:feature`, `origin:core` | `SiteShell`, `PageTemplate`, `PageTemplateProps`, `usePageReady()`, `useSite()`, `buildMenus()`, `resolvePage()` |
| `@inithium/web-pages` | `libs/web/pages` | `scope:web`, `type:feature`, `origin:core` | `coreTemplates`, `HomePage`, `LoginPage`, `NotFoundPage`, `ProfilePage`, `SignUpPage`, the profile slot types, `ProfileSlotsProvider`, `profileCard` |
| `@inithium/shared-data-access` | `libs/shared/data-access` | `scope:shared`, `type:data-access`, `origin:core` | `baseApi`, auth hooks (including `useRegisterMutation()` and `useChangePasswordMutation()`), `useGetSiteQuery()`, page hooks (`useGetPagesQuery()`, `useGetPageQuery()`, `useUpdatePageMutation()`, `useDeletePageMutation()`, `useSaveContentDraftMutation()`, `usePublishContentMutation()`, `useDiscardContentDraftMutation()`, `useGetPageTemplatesQuery()`, `useCreatePageMutation()`, `useDuplicatePageMutation()`), settings hooks (`useGetSettingsQuery()`, `useUpdateSettingsMutation()`), profile hooks (`useGetProfileQuery()`, `useUpdateMyProfileMutation()`), asset hooks (`useGetStorageInfoQuery()`, `useGetAssetsQuery()`, `useGetAssetQuery()`, `useUploadAssetMutation()`, `useUpdateAssetMutation()`, `useDeleteAssetMutation()`, `useGetAssetUsageQuery()`), user management hooks (`useGetUsersQuery()`, `useGetUserManagementInfoQuery()`, `useCreateUserMutation()`, `useUpdateUserMutation()`, `useResetUserPasswordMutation()`, `useDeleteUsersMutation()`), the form helpers `fieldErrorsFrom()`, `readApiFailure()` and `focusFirstError()`, `createAppStore()`, `getApiErrorMessage()`, the `modals` slice (`openModal`, `closeModal`) and `useModal()`, the `alerts` slice (`showAlert`, `dismissAlert`) and `useAlerts()` |
| `@inithium/cms-auth` | `libs/cms/auth` | `scope:cms`, `type:feature`, `origin:core` | `LoginPage`, `CmsAccessGuard` |
| `@inithium/cms-shell` | `libs/cms/shell` | `scope:cms`, `type:feature`, `origin:core` | `CmsShell`, `CmsScreen`, `DashboardPage`, `CmsAlerts`, `CmsTheme` |
| `@inithium/cms-pages` | `libs/cms/pages` | `scope:cms`, `type:feature`, `origin:core` | `PagesScreen`, `PageEditor` |
| `@inithium/cms-media` | `libs/cms/media` | `scope:cms`, `type:feature`, `origin:core` | `MediaScreen`, `AssetPicker`, `AssetField`, `FontField`, `FontSample`, `useFontWeights()`, `weightsCovered()` |
| `@inithium/cms-users` | `libs/cms/users` | `scope:cms`, `type:feature`, `origin:core` | `UsersScreen`, `NewUserDialog`, `UserDetails`, `DeleteUsersDialog`, `ROLE_LABELS` |
| `@inithium/cms-settings` | `libs/cms/settings` | `scope:cms`, `type:feature`, `origin:core` | `SettingsScreen`, `ThemeColorField`, `normalizeHex()` |

### `@inithium/api-config`

The only code that reads `process.env`. `loadEnv()` validates the environment once against `envSchema`, caches the result and returns it typed as `Env`. It throws a readable error listing every invalid variable. See [Environment variables](../backend/environment-variables.md).

### `@inithium/api-http`

The api's error handling for `/api`, used by `main.ts` and by the test app. `apiNotFound` answers unknown paths with a JSON 404; `apiErrorHandler` turns a thrown `HttpError` (an `Error` with a `status` and an optional `field`) into its response, and hides anything 500 or above behind a generic message. See [The api app](../backend/api-app.md#errors).

### `@inithium/api-testing` and `@inithium/api-testing-accounts`

The test kits ([0103](../decisions/0103-test-with-vitest-and-a-plugin-contract-kit.md)), tagged `type:testing`. Only spec files import them, and they have only a `tsconfig.spec.json`, so no build includes them.

- `api-testing` holds the test app and HTTP client, database snapshots, the environment tests run with, and the plugin contract checks. Its folder also holds the Vitest setup files that `core/vitest.preset.mts` loads for `database: true` projects: the in-memory MongoDB server, a database per test file, and the test environment.
- `api-testing-accounts` creates accounts and signs clients in.

See [Testing](../getting-started/testing.md) and [Testing plugins](../plugins/testing-plugins.md).

### `@inithium/api-database`

Owns the Mongoose connection.

- `connectDatabase(uri)` connects with a 10-second server-selection timeout and logs the database name, never the URI. Error and disconnect listeners are attached only after the first connection succeeds, so a failed startup reports a single error.
- `disconnectDatabase()` removes the disconnect listener and closes the connection.

The api calls `connectDatabase` before it listens and `disconnectDatabase` on SIGTERM or SIGINT. `isDatabaseConnected()` and `healthRouter` (mounted at `/api/health`) report the connection for Render's health check.

### `@inithium/api-users`

The `users` collection. `UserModel` stores `email` (unique, lowercased), `passwordHash` (excluded from queries unless selected with `+passwordHash`), `role` (default `user`) and `passwordChangeRequired`, with timestamps, and the `profile` (names, bio, avatar and banner recipes). `toUser()` maps a stored user to the API's `User` shape and `toPublicProfile()` to a `PublicProfile`. Also exports `findUserById()`, `findUserByIdWithPassword()`, `findUserByEmailWithPassword()`, `userExistsWithEmail()`, `userExistsWithRole()`, `createUser()` (always with a generated avatar and banner), `updateUserProfile()`, `backfillUserProfiles()` (run on every start) and the generators `createProfileAvatar()` and `createProfileBanner()`. See [Users](../backend/users.md) and [Profiles](../backend/profiles.md).

### `@inithium/api-auth`

Authentication for the API: the `/api/auth` routes, the `requireAuth` / `requirePermission()` / `requireSession` middleware, `getAuth()` for reading the signed-in user inside a protected route, `readAuth(req)` for reading an optional session on a public route, `seedDevUser()`, which the api calls after connecting, `hashPassword()`, and `revokeSessions()` / `endSessionsOfDeletedUsers()` for signing accounts out at once ([0100](../decisions/0100-manage-accounts-from-the-cms.md)). Internally it owns password hashing (`scrypt`), access tokens, the `refreshtokens` collection and the auth cookies. See [Authentication](../backend/authentication.md).

### `@inithium/api-user-management`

Managing accounts from the CMS ([0100](../decisions/0100-manage-accounts-from-the-cms.md)): `createUsersRouter({ deletionHooks })` (`/api/users`), the service functions behind it (`listManagedUsers()`, `createManagedUser()`, `updateManagedUser()`, `resetManagedUserPassword()`, `deleteManagedUsers()`, `userManagementInfo()`), and the `UserDeletionHook` contract plugins implement. See [User management](../backend/user-management.md).

### `@inithium/api-pages`

The `pages` collection ([0078](../decisions/0078-store-pages-as-records-rendered-by-code-templates.md)): `PageModel`, `toPage()` / `toPublicPage()`, `listPages()`, `listPublishedPages()`, `findPageById()`, `createPage()`, `duplicatePage()`, `updatePage()` (the edit rules), `deletePage()`, `saveContentDraft()`, `publishContent()` and `discardContentDraft()`; `reusableTemplates` / `listReusableTemplates()`; `pagesRouter` (`/api/pages`) and `siteRouter` (`/api/site`); and `seedPages()` / `seedCorePages()` / `corePageSeeds` (with `seedKey`s for content pages) and `privacyPolicyContent()`. See [Pages](../backend/pages.md).

### `@inithium/api-profiles`

The profile API ([0090](../decisions/0090-generate-and-show-user-profiles.md)): `profilesRouter`, mounted at `/api/profiles` (`GET /:id`, `PATCH /me`). The data and its service functions are in `@inithium/api-users`. See [Profiles](../backend/profiles.md).

### `@inithium/api-assets`

Uploaded files ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)): `AssetModel` and `AssetBlobModel` (the database driver's bytes), the storage drivers (the database and Cloudflare R2, through `@aws-sdk/client-s3`; `startStorage()` picks one from `STORAGE_MODE` on startup and checks R2 can be reached, `driverFor()` reads a file from whichever holds it), `processUpload()` (type detection by contents, WebP conversion under 2 MB, SVG sanitising, TTF/OTF to WOFF2), the asset service (`createAsset()`, `listAssets()`, `assetUsage()`, `deleteAsset()`, `storageInfo()`, and `checkProfileImage()` / `releaseProfileImage()` for members' pictures, …) and `assetsRouter` (`/api/assets`, with the member upload rate limit); also the font library's routes, `fontFamiliesRouter` (`/api/fonts`), its service (`createFontFamily()`, `updateFontFamily()`, `deleteFontFamily()`, `fontFamilyUsage()`, `backfillFontFamilyMetrics()`) and `readFontInfo()`, which reads a font file's weight, style and metrics with `fontkit`. See [Assets](../backend/assets.md) and [0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md). See [Assets](../backend/assets.md).

### `@inithium/api-fonts`

The font library's data ([0111](../decisions/0111-keep-uploaded-font-families-in-a-library.md)): `FontFamilyModel` (`font_families`), `toFontFamily()` and the queries and updates other libs need (`listFontFamilies()`, `findFontFamily()`, `findFontFamilyWithFile()`, and `removeFontFile()` / `renameFontFile()`, which keep families in step when a file is deleted or renamed), `toSiteFontFamily()` (the site bundle's shape), and `markFontsChanged()` / `fontsVersion()`, which tell `themeFontsHead()` to rebuild. It sits below `api-assets`, `api-settings` and `api-pages`, so they can all read families. Creating and changing families, which checks the files, is in `@inithium/api-assets`. See [Assets](../backend/assets.md#font-families).

### `@inithium/api-settings`

The one site settings record ([0082](../decisions/0082-keep-site-wide-settings-in-one-record.md)): `SettingsModel`, `toSiteSettings()`, `getSiteSettings()`, `updateSiteSettings()`, `DEFAULT_SITE_SETTINGS`, `settingsRouter` (`/api/settings`) and `seedSiteSettings()`. Also the theme's fonts ([0111](../decisions/0111-keep-uploaded-font-families-in-a-library.md), [0114](../decisions/0114-load-the-clients-fonts-without-a-flash.md)): `fontRolesUsing()` (which roles use a family), and `themeFontsHead()` / `renderAppPage()`, which write the font rules into each app's `index.html`. See [Site settings](../backend/site-settings.md).

### `@inithium/shared-contracts`

The Zod schemas shared by the api and both frontends, with inferred types: `roles` / `roleSchema` / `Role`, `userSchema` / `User`, `loginRequestSchema` / `LoginRequest`, `registerRequestSchema` / `RegisterRequest`, `emailSchema`, `newPasswordSchema` (with `passwordPolicy` and `passwordPolicyHint`), `userProfileSchema` / `UserProfile`, `profileLimits`, `profileName()`, `userDisplayName()`, the profile contracts (`publicProfileSchema` / `PublicProfile`, `updateProfileRequestSchema` / `UpdateProfileRequest`, `profileViewers` / `ProfileViewer`, `publicProfileName()`), `authResponseSchema` / `AuthResponse`, `permissions` / `permissionSchema` / `Permission`, the page contracts (`pageSchema` / `Page`, `publicPageSchema` / `PublicPage`, `pageUpdateSchema`, `pageNavigationSchema`, `pagePathSchema`, `pageAudiences`, `navLocations`, `navigationAllowed()`, `pathHasParams()`) and the site settings contracts (`siteSettingsSchema` / `SiteSettings`, `siteSettingsInputSchema`, `siteLogoSchema`, `logoImage()`, `siteBundleSchema` / `SiteBundle`) the rich text contracts (`richTextDocumentSchema` / `RichTextDocument`, `richTextFeatures`, `restrictedRichTextSchema()`, `richTextLength()`, `richTextIsEmpty()`, `richTextFromPlainText()`, and the bio's `bioSchema` / `bioFeatures`), the user management contracts (`managedUserSchema` / `ManagedUser`, `userListQuerySchema`, `userListResponseSchema`, `createUserRequestSchema`, `updateUserRequestSchema`, `deleteUsersRequestSchema`, `deleteUsersResponseSchema`, `userManagementInfoSchema`) and the asset contracts (`assetSchema` / `Asset`, `assetFileTypes`, `assetPurposes`, `assetKinds`, `storageModes`, `storageInfoSchema`, `assetUsageSchema`, `MAX_ASSET_BYTES`, `assetUrl()`) and the font contracts (`fontFamilyRecordSchema` / `FontFamilyRecord`, `fontFamilyCreateSchema`, `fontFamilyUpdateSchema`, `fontFileInfoSchema` / `FontFileInfo`, `fontFallbacks`, `MAX_FONT_FAMILIES`, `fontFamilyCssName()`, `fontStack()`, `fontFaceCss()`, `fontWeightLabel()`, `fontFilesOverlap()`, and for the theme `themeFontsSchema` / `ThemeFonts`, `siteFontFamilySchema` / `SiteFontFamily`, `themeFontsCss()`, `themeFontPreloads()`, `fallbackFaceCss()`, `mainFontFile()`, `familyFontStack()`, `fontFamilyVariable()`; and in the UI contracts `fontRoles`, `fontFamilySchema` (a role or `{ familyId }`, type `FontFamilyValue`) and `fontPickerPropsSchema`; and in the content contracts `contentTypographySchema` / `ContentTypography`, `richTextStyleAttrsSchema` / `RichTextStyleAttrs` and `richTextSizePresets`; the content element contracts (`contentDocumentSchema` / `ContentDocument`, `contentElementSchema` / `ContentElement`, a props schema and type per element, `pluginElementSchema`, `contentElementTypes`, `MAX_CONTENT_ELEMENTS`, `MAX_CONTENT_DEPTH`, `readContentDocument()`, `emptyContentDocument()`, `flattenContentElements()`, `contentReferences()`, `richTextInlineParts()`, and the content elements slot: `ContentElementContract`, `registerContentElementContracts()`, `contentElementContract()`), and version 1's (`contentDocumentV1Schema` / `ContentDocumentV1`, the section and block schemas, `upgradeContentV1()`)).

### `@inithium/shared-ui-theme`, `@inithium/shared-ui-components`, `@inithium/shared-ui-composites` and `@inithium/shared-ui-layouts`

The four layers of the UI library. See the [UI library](../ui-library/index.md) section, with a page per component. `shared-ui-theme` also exports `FontFaces`, which declares uploaded font files with `@font-face` rules, and `ThemeFonts`, which applies the theme's fonts at runtime ([Theme: fonts](../ui-library/theme/index.md#fonts)).

### `@inithium/shared-media`

Uploading, shared by the CMS and (later) `web`'s profile ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)): `UploadForm` (choose or drop a file, crop or fit images to the purpose's shapes, alt text, the font licence), `UploadDialog` (the form in a Modal), `AssetThumbnail` and the helpers `formatBytes()`, `CROP_SHAPES`, `PURPOSE_LABELS`, `KIND_ICONS` and `resolveCssColor()`. See [Assets](../backend/assets.md).

### `@inithium/shared-content`

Draws content pages ([0116](../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)): `ContentRenderer` (a content document's elements, each drawn by `ContentElementView`), with `RichText` for rich text documents (the UI library's `RichTextView` plus page links, [0102](../decisions/0102-edit-rich-text-fields-with-tiptap-and-store-json.md)). Links resolve through the `links` prop (`pagePath`, `onNavigate`); `decorators` (`element`, `children`) let a host wrap what's drawn. Used by `web`'s `content` template and the page builder's preview. Plugin elements draw through `ContentElementRenderersProvider`, which each app fills from its registry (`ContentElementRenderer` `{ type, component }`). See [Content pages](../architecture/content-pages.md).

### `@inithium/cms-content-editor`

The CMS's page builder ([0094](../decisions/0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md), [0116](../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)): `ContentEditorScreen` (the `/pages/:id/content` route, holding the edit lock with `useContentLock()`), `PageBuilder`, `LayersPanel`, `AddElementDialog` (the Add picker), `MoveToDialog`, `ElementProperties` (the properties tabs) with its fields (`property-fields.component.tsx`: `DeviceField`, `StepField`, `SidesField`, `SizeField` …), the iframe `PreviewFrame`, the TipTap `RichTextEditor` and `RichTextToolbar` (the converters, `richTextToTiptap()` / `tiptapToRichText()`, are in `@inithium/shared-ui-composites`), the accessibility checks (`accessibility-checks.service.ts`, and `scanContrast()` measuring the preview), plugin elements (`ContentElementEditor`, `registerContentElementEditors()`, `PluginElementProperties`, `addPickerGroups()`), the pure operations (`content-tree.service.ts` for the tree, `device-values.service.ts` for per-device values, `property-values.service.ts` for spacing, sides and arranging a Container in a row) and the `useContentHistory()` / `useAutosave()` hooks. See [Content pages](../architecture/content-pages.md#editing).

### `@inithium/shared-auth-ui`

Auth screens shared by `web` and the CMS: `PasswordChangeScreen`, shown to accounts that must change a temporary password ([0088](../decisions/0088-make-temporary-passwords-change-on-first-sign-in.md)), and the `PasswordChangeForm` inside it, which the profile's Account tab also uses.

### `@inithium/web-shell`

`web`'s page system ([0079](../decisions/0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)): `SiteShell` (render it inside a router and the Redux store, with every template), the template contract `PageTemplate` / `PageTemplateProps`, `usePageReady()`, `useSite()`, and the pure `buildMenus()`, `resolvePage()` and `audienceRedirect()`. See [Pages and routing](../architecture/pages-and-routing.md).

### `@inithium/web-pages`

Core's page templates, `coreTemplates`: Home, Profile, Login, Sign up and Not Found, matching the pages the api seeds. Login and Sign up are real forms with a red AlertStack alert and per-field errors ([0083](../decisions/0083-let-visitors-sign-up-for-user-accounts.md)). `ContentPage` is the reusable `content` template ([Content pages](../architecture/content-pages.md)). Profile is the real profile page with its About and Account tabs; the profile slot types (`ProfileSlots`, `ProfileTab`, `ProfileSidebarSection`, `ProfileHeaderAction`, `ProfileSlotProps`) and `ProfileSlotsProvider` let the web registry add to it ([Profiles](../backend/profiles.md)).

### `@inithium/shared-permissions`

The permission matrix (`rolePermissions`) and `hasPermission(role, permission)`. `dev` holds every permission. Also the role rules for managing accounts ([0100](../decisions/0100-manage-accounts-from-the-cms.md)): `assignableRoles(role)` (up to your own, never dev) and `canManageRole(actor, target)`.

### `@inithium/shared-data-access`

The frontends' RTK Query layer. `baseApi` calls `/api` and, on a `401`, refreshes the session once and retries. Features add endpoints with `baseApi.injectEndpoints()` (e.g. the assets endpoints and the font library's, `useGetFontFamiliesQuery` and its create, update and delete mutations). Also exports the auth endpoints (`useGetCurrentUserQuery`, `useLoginMutation`, `useLogoutMutation`), `createAppStore()` for an app's root `<Provider>`, `getApiErrorMessage()`, and the global modal state: the `modals` slice (`openModal(id)`, `closeModal(id?)`, `selectOpenModalId`) and `useModal(id)` ([Modal](../ui-library/composites/modal.md)); and the global alert queue: the `alerts` slice (`showAlert(content)`, `dismissAlert(id)`, `removeAlert(id)`, `selectAlerts`) and `useAlerts()` ([AlertStack](../ui-library/composites/alert-stack.md)).

### `@inithium/cms-auth`

CMS sign-in: `LoginPage` (route `/login`, the same card and form errors as `web`'s Login) and `CmsAccessGuard` (wrap any route that needs CMS access).

### `@inithium/cms-shell`

The signed-in CMS ([0086](../decisions/0086-run-the-cms-in-a-sidebar-frame-with-a-pages-screen.md)): `CmsShell` (the SidebarLayout frame, routing a list of `CmsScreen`s and hiding those the user can't use), `DashboardPage`, `CmsAlerts` (the app's AlertStack) and `CmsTheme` (the client's theme over the default). See [The CMS](../architecture/cms.md).

### `@inithium/cms-pages`

The Pages screen: `PagesScreen` (search, sort and rows) and `PageEditor` (the tabbed edit dialog).

### `@inithium/cms-media`

The CMS's Media screen and the asset picker ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)): `MediaScreen` (storage meter, search, kind filter, grid, details modal, and the font library: `FontLibrary` and `FontFamilyDialog`), `FontField` (a form field holding one font: a FontPicker over the library's families with files; Settings' theme fonts and the content editor use it), `useFontWeights(font)` (the weights a font has, for weight lists), `FontSample` (draws its children under a CSS family name Text can't name: a file not yet in a family, or Inithium's default fonts), `AssetPicker` (choose from the library or upload in place, in a Modal) and `AssetField` (a form field holding one asset id, used by the logo and the Image block). See [The CMS](../architecture/cms.md#media).

### `@inithium/cms-users`

The CMS's Users screen ([0100](../decisions/0100-manage-accounts-from-the-cms.md)): `UsersScreen` (paged list, search, role filter, bulk delete), `NewUserDialog`, `UserDetails` (the details Modal) and `DeleteUsersDialog`. See [The CMS](../architecture/cms.md#users).

### `@inithium/cms-settings`

The Settings screen ([0087](../decisions/0087-set-theme-colours-in-cms-settings.md)): `SettingsScreen` (site details, theme colours and theme fonts) and `ThemeColorField` (a hex field with its generated scale). The theme fonts' Select with its sample is the internal `ThemeFontField`.

## Creating a lib

Libs are non-buildable source libs; the consuming app compiles them. From `core/`:

```sh
npx nx g @nx/node:library --directory=libs/<scope>/<name> --name=<scope>-<name> \
  --importPath=@inithium/<scope>-<name> --tags=scope:<scope>,type:<type>,origin:core \
  --buildable=false --unitTestRunner=none --linter=eslint --strict --useProjectJson --no-interactive
```

Keep `--unitTestRunner=none`: the generator's Vitest option also rewrites the root ESLint config and adds files Inithium doesn't use. Tests are added by hand in step 4.

For React libs, use `@nx/react:library` with `--bundler=none --style=none --component=false` instead of `--buildable=false --strict`. Then:

1. Delete the generated placeholder file and README, and a React lib's `.babelrc` (unused, because Vite compiles the lib as part of the app).
2. Check the lib has an `eslint.config.mjs` that spreads the root config.
   - Tailwind classes in libs are picked up because each app's `styles.css` contains `@source "../../../libs";`. Without that line, Tailwind only scans the app's own folder.
3. Add the lib to the table above.
4. Give it tests ([Testing](../getting-started/testing.md)):
   - `vitest.config.mts`: `export default projectTestConfig(import.meta.dirname)`, importing `projectTestConfig` from `<root>/vitest.preset.mts`. Pass `{ database: true }` for api code or `{ environment: 'jsdom' }` for React components.
   - `tsconfig.spec.json`: extends `./tsconfig.json`, with `types: ["node"]` and `include: ["src/**/*.spec.ts", "src/**/*.spec.tsx", "src/**/*.d.ts"]`. Add it to `tsconfig.json`'s `references`, and exclude spec files from `tsconfig.lib.json`.
   - A `typecheck` target in `project.json`: `nx:run-commands` running `tsc --noEmit -p tsconfig.spec.json` in `{projectRoot}`, cached, with inputs `default` and `^production`. Copy it from an existing lib, e.g. `libs/api/pages/project.json`.

Tags and the boundary rules they enforce are listed in [Conventions](conventions.md#tags-and-module-boundaries).
