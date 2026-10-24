---
title: How plugins work
description: How a plugin is laid out, installed as libs, wired in through slot registries, seeded, and ejected.
scope: ecosystem
tags: [plugins, architecture, seeding]
order: 1
decisions: ["0002", "0015", "0016", "0019", "0026", "0029", "0100", "0103", "0105", "0116", "0118"]
---

# How plugins work

A plugin adds one optional capability to a core clone, end to end. It's built so that a client who doesn't use it has none of its code, and a client who does gets it installed rather than rebuilt ([0002](../decisions/0002-install-plugins-as-nx-libs-via-registries.md)). No plugins exist yet; this page describes the design they'll follow.

## A plugin's layout

In the Inithium repo, each plugin is a folder of layers, and each layer is an Nx lib:

```
plugins/plugin-<name>/
  api/         Express routes, Mongoose models, services, seed and unseed
  web/         React components for the end-user site, and their RTK Query endpoints
  cms/         React components for the client portal, and their RTK Query endpoints
  contracts/   Zod schemas and inferred types shared by the layers above
  shared/      Optional: React that both web and cms draw, e.g. content element renderers (0118)
  docs/        The plugin's manual pages and decisions (never installed into a client)
```

## Installing: libs, never app code

Installed into a core clone, a plugin lands as libs. Nothing goes inside an app:

```
core/libs/plugins/<name>/
  api/        -> @inithium/plugin-<name>-api
  web/        -> @inithium/plugin-<name>-web
  cms/        -> @inithium/plugin-<name>-cms
  contracts/  -> @inithium/plugin-<name>-contracts
  shared/     -> @inithium/plugin-<name>-shared     (scope:shared, type:feature, origin:plugin)
```

A plugin may depend on core libs and on its own layers. Whether one plugin may depend on another (e.g. `ecom` using `storage`) is still open ([0016](../decisions/0016-plugin-to-plugin-dependencies.md)).

## Slots: how a plugin plugs in

Core defines **slot points**: typed extension contracts such as API route mounts, Mongoose models, `web` pages and routes, `cms` screens and navigation entries.

- **Registry files:** each app has a registry file that core ships **empty**. Installing a plugin adds one registration to the registry of each app it touches, and ejecting removes it.
- **The install/eject tooling owns the registries.** Don't hand-edit them, and core never adds entries itself. With empty registries, the apps build and run with no plugin code at all.
- **New extension points are slot contracts.** When core needs one, it adds a new slot contract and wires it in through the registry; core never looks for a particular plugin.

Three registries exist:

- `apps/web/src/app/plugins.registry.ts`, where plugins (and `libs/client/`) register `web` page templates ([Pages and routing](../architecture/pages-and-routing.md#writing-a-template)) and profile tabs, sidebar sections and header actions ([Profiles](../backend/profiles.md#adding-to-the-profile)).
- `apps/api/src/app/plugins.registry.ts`, where they register **user deletion hooks**, which remove a plugin's data when accounts are deleted ([User management](../backend/user-management.md#plugin-deletion-hooks), [0100](../decisions/0100-manage-accounts-from-the-cms.md)), **content element contracts**, **setup checklist steps** for the CMS dashboard ([The CMS dashboard](../backend/dashboard.md#adding-a-step)), **presence statuses** (in all three registries, [Presence](../backend/presence.md#the-status-registry), [0124](../decisions/0124-show-who-is-online-with-a-status-light-on-avatars.md)), and **realtime channels**, served with `serveRealtimeChannel()` ([Realtime](../backend/realtime.md#serving-a-channel), [0121](../decisions/0121-add-a-realtime-pub-sub-layer-on-socket-io.md)). Any plugin that keeps per-user data needs a hook.
- `apps/cms/src/app/plugins.registry.ts`, where they register content elements' contracts, renderers and page builder entries, and **dashboard widgets**, which CMS users add to their dashboards from a picker ([The CMS](../architecture/cms.md#adding-a-widget), [0120](../decisions/0120-give-each-cms-user-a-dashboard-of-widgets.md)).

`web`'s registry also lists content element renderers.

## Adding content elements

A plugin can add elements to the [page builder](../architecture/content-pages.md#editing) ([0116](../decisions/0116-build-content-pages-from-a-tree-of-library-elements.md)), typed `plugin-<name>:<element>`. Each comes in three parts, one per layer:

```tsx
// contracts: what it stores, checked by the api and the CMS
export const productGridContract: ContentElementContract = {
  type: 'plugin-shop:product-grid',
  props: z.object({ columns: z.number().int().min(1).max(6), featuredPageId: z.string().optional() }).strict(),
  // Ids it refers to, so deleting a page or an asset warns. Without it, props are scanned for reference shapes.
  references: (props) => ({ pageIds: props.featuredPageId ? [String(props.featuredPageId)] : [] }),
  // children: true lets it hold other elements.
};

// shared: how it draws, on the site and in the builder's preview (0118)
export const productGridRenderer: ContentElementRenderer = {
  type: 'plugin-shop:product-grid',
  component: ({ element, children }) => <ProductGrid columns={Number(element.props.columns)}>{children}</ProductGrid>,
};

// cms: how the builder offers and edits it
export const productGridEditor: ContentElementEditor = {
  type: 'plugin-shop:product-grid',
  label: 'Product grid',
  icon: 'shopping-bag',
  description: 'Products from the shop, in columns',
  group: 'Shop', // or an existing group: 'Layout', 'Text and media', 'Actions'
  create: () => ({ props: { columns: 3 } }),
  properties: ProductGridProperties, // gets { element, onChange, device, pages, problems }
};
```

The registries list them: the contract in the api's and the CMS's, the renderer in `web`'s and the CMS's, and the editor entry in the CMS's. While the plugin isn't registered (inactive or ejected), its elements stay in pages as they are: the builder shows a placeholder that can be moved or deleted, and the site leaves them out.

The rest of the slot catalogue, and every other contract's exact shape, is still open ([0015](../decisions/0015-slot-catalogue.md)). Activation (0105) isn't built yet, so a registered plugin counts as active.

## Seeding and unseeding

- **Seed:** every plugin ships an idempotent seed, run on install. It creates the plugin's default `cms` pages, settings, navigation entries and any required data, and running it twice creates nothing new.
- **Unseed:** every plugin ships an unseed, run on eject, which removes **only** what its own seed created.
- **Where they live:** both live in the plugin's `api` lib.

How unseed identifies exactly what its seed created is still open ([0019](../decisions/0019-seed-tracking.md)). Either way, every plugin proves both rules with the contract checks in [Testing plugins](testing-plugins.md).

## A plugin's data

- **Plugins never add fields to `users`,** or to the core user schema or contract. A plugin keeps per-user data in its own collections, each document carrying a `userId`. For example, `ecom` would own `addresses` ([0026](../decisions/0026-plugins-keep-user-data-in-their-own-collections.md)).
- **Data comes from the plugin's own endpoints.** Anything a frontend needs is served there, never added to `GET /api/auth/me`.
- **Deleting a user:** a plugin with per-user data registers a user deletion hook in the api registry, so its data goes when the account does, without core knowing which plugins exist. Its tests prove the hook with `expectUserDeletionHook()` ([Testing plugins](testing-plugins.md)).
- **Uploads:** staff uploads work in every storage mode; member uploads only in `cloud-all`. Check `memberUploads` from `GET /api/assets/storage`, never the mode or driver ([0029](../decisions/0029-storage-requirements-for-plugin-uploads.md)).

## Drawing in both modes

A plugin's `web`, `cms` and `shared` UI must work in light and [dark mode](../ui-library/theme/dark-mode.md) with no code of its own for it ([0119](../decisions/0119-let-each-user-choose-light-or-dark-mode.md)):
- build from the UI library with theme colours in their roles (backgrounds 50–400, text 600–950, borders 500);
- use Tailwind colours only for what must look the same in both modes;
- use no hex codes, `white` or `black`.

Plugin libs spread core's ESLint config, so the `inithium/no-fixed-colors` rule checks them too ([Conventions](../reference/conventions.md#theme-colours)).

## Ejecting

Ejecting a plugin is:
1. run its unseed, from the running site while its code is still installed;
2. remove its registry entries;
3. delete `libs/plugins/<name>/`, and deploy.

An installed plugin can also be **deactivated** instead: switched off on the CMS Plugins screen, keeping its code and data. See [Plugin lifecycle](plugin-lifecycle.md) ([0105](../decisions/0105-manage-plugins-with-one-install-tool-activation-and-versions.md)) for activation, versions and upgrades.

Afterwards the workspace must type-check and build exactly as it did before the plugin was installed.
