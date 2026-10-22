---
id: "0120"
title: Give each CMS user a dashboard of widgets
status: accepted
date: "2026-10-21"
scope: core
tags: [cms, dashboard, plugins, slots]
related: ["0015", "0086", "0100", "0105", "0107", "0117"]
supersedes: []
---

# 0120. Give each CMS user a dashboard of widgets

## Context

The CMS's Dashboard (`/cms`, [0086](0086-run-the-cms-in-a-sidebar-frame-with-a-pages-screen.md)) was an empty screen. The CMS's users have different jobs, and plugins will each have something worth showing at a glance (a blog's quick post, a shop's orders), so one fixed dashboard can't suit everyone. Plugins also need a way to ask a new client to set something up, e.g. a shop's payments.

## Decision

**Each CMS user builds their own dashboard from widgets.**

- **Widgets come through a slot** ([0015](0015-slot-catalogue.md)): `DashboardWidgetDefinition` in `@inithium/cms-dashboard`, `{ type, label, description, icon, permission?, widths, defaultWidth, settingsSchema, defaultSettings, component }`, listed as `registeredDashboardWidgets` in the CMS's registry. The component gets `{ settings, onSettingsChange, width }`; it fetches its own data from its own endpoints and may be `React.lazy`. Plugin types are named `plugin-<name>:<widget>`.
- **Layouts are stored per user**, in a `dashboards` collection (`{ userId, widgets: [{ id, type, width, settings }] }`), written only once the user changes something. A user with no record sees **the code default**: core's Setup checklist (1/3) then Members (2/3) widgets, each shown only if the user holds its permission. Plugins and client libs can never add to the default or to anyone's dashboard: their widgets appear only in the picker, and a user must add them.
- **Widths** are 1/4, 1/3, 2/3, 3/4 and full of the row; each widget declares which it allows. Widgets sit in a wrapping row, each **half of the screen under the top bar tall** (at least 300px), so at most two rows show above the fold. Narrower dashboards drop to halves (1/4 and 1/3 → 1/2, 2/3 and 3/4 → full) and then to full width.
- **No edit mode.** The next slot is always an **add tile** (1/3 wide, dashed border, a darker background and a plus button) opening a picker of every widget the user may use. Each widget's header has ← → buttons (swap with the widget before or after it) and a menu with its widths and Remove. A widget's own controls (e.g. a range) sit in its body and save into its `settings`.
- **A widget the CMS no longer knows** (its plugin ejected or inactive, [0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)) or that the user lost the permission for is left out but kept in the stored layout. Each widget has its own error boundary. Deleting an account deletes its dashboard.
- **Core's widgets:**
  - **Members** (`member-growth`, needs `users.view`): the running total of `user` accounts by join date (staff left out) over a range chosen in the widget (past week, month, quarter, 6 months, 12 months, all time), with the number new in that range. Deleted accounts drop out of the history; this is accepted rather than keeping daily snapshots.
  - **Setup checklist** (`setup-checklist`, needs `settings.edit`): steps a new site should take, each ticked automatically from data or, where it can't be detected, by hand (site-wide, by any owner or admin). It never hides itself when everything is done, since steps will be added; a user removes it if they want to.
- **Setup checklist items are a slot too**, on the api: `SetupChecklistItem` `{ id, label, description?, href?, order, isDone?() }` in `@inithium/api-dashboards`, listed as `registeredSetupChecklistItems` in the api's registry. An item without `isDone` is ticked by hand.
- **Charts** use Chart.js, wrapped by the `Chart` composite in `@inithium/shared-ui-composites`; nothing uses Chart.js directly.

## Alternatives considered

- **An edit mode toggle** for arranging the dashboard: rejected in favour of controls that are always there.
- **Drag to reorder:** not wanted; the ← → buttons swap neighbours.
- **Plugins adding their widgets to everyone's dashboard:** rejected; widgets must be sought out in the picker. A client needing a widget for all staff is handled case by case.
- **Owners setting the default layout for their staff:** not wanted; the default is code's, and users build from it.
- **True member history from daily snapshots:** rejected for now; core has no scheduler, and members by join date is good enough.
- **Our own SVG charts** (as PolyBanner draws its own pattern): rejected in favour of a battle-tested library. Chart.js was chosen over Recharts and ECharts (much heavier) and uPlot (smaller, but time series only).

## Consequences

- A new lib, `@inithium/cms-dashboard`, holds the screen, the slot type and core's widgets; `@inithium/api-dashboards` holds the stored layouts, the members series and the setup checklist, at `/api/dashboard`.
- Chart.js draws on a canvas, so the `Chart` composite reads the theme's colours when it draws and redraws when the colour scheme changes, and gives every chart a text alternative.
- Plugin widgets whose data needs the plugin's own api routes wait for the API routes slot (still open in 0015).
- What a widget or checklist item does while its plugin is inactive is left out for now; the details stay open in [0107](0107-plugin-lifecycle-mechanics.md).
