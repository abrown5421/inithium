---
title: The CMS dashboard
description: The api behind the CMS Dashboard - each user's saved widgets, the Members series, and the setup checklist with its slot for plugins' steps.
scope: core
tags: [api, cms, dashboard, plugins]
order: 12
decisions: ["0120", "0015", "0100"]
---

# The CMS dashboard

The CMS's Dashboard ([The CMS](../architecture/cms.md#the-dashboard)) is drawn by the CMS, but its data comes from `/api/dashboard`, in `@inithium/api-dashboards` ([0120](../decisions/0120-give-each-cms-user-a-dashboard-of-widgets.md)): each user's saved widgets, and the data for core's two widgets.

## Saved dashboards

Each CMS user's dashboard is one record in `dashboards`: `{ userId, widgets }`, where each widget is `{ id, type, width, settings }` (`dashboardWidgetSchema` in `@inithium/shared-contracts`).

- **No record means the default dashboard.** A record is written the first time the user changes anything; an empty list is a dashboard of its own, not the default.
- **The api doesn't know widget types.** It checks the shape: ids unique and made of letters, digits, `_` and `-`; `type` a kebab-case name or `plugin-<name>:<widget>`; `width` one of `1/4`, `1/3`, `2/3`, `full`; `settings` an object of at most 4,000 characters of JSON; at most 32 widgets (`MAX_DASHBOARD_WIDGETS`). Each widget's settings are checked by its definition in the CMS.
- **Deleting an account** deletes its dashboard (`deleteDashboardsOfUsers()`, after the account's member uploads; [User management](user-management.md#deleting-accounts)).

## The Members series

`GET /api/dashboard/members?range=&tz=` gives the Members widget its numbers: `user` accounts (staff are left out) by the day they joined, as a running total.

- **`range`** is `week`, `month`, `quarter`, `half-year`, `year` or `all` (default `month`). The week and month ranges are grouped by day (7 and 30 points), the quarter and 6 months by week (13 and 26 weeks, from Monday), the year by month (12). All time starts at the first member's join day and is grouped by day under 60 days, by week under two years, and by month after that.
- **`tz`** is the viewer's IANA time zone (e.g. `Europe/London`, default `UTC`), so a day is the viewer's day. An unknown one is refused with `field: 'tz'`.
- **The answer** is `{ range, unit, total, joined, points }`: `total` is today's count, `joined` how many joined within the range, and each point `{ date, joined, total }` is a period's first day (`YYYY-MM-DD`), the members who joined in it, and the total by its end. Every period is present, including empty ones.
- **Deleted accounts aren't counted anywhere**, so the history shows the members who are still here by when they joined, not how many there were on each past day ([0120](../decisions/0120-give-each-cms-user-a-dashboard-of-widgets.md) accepts this rather than keeping daily snapshots).

The pure parts (`buildMemberGrowth()`, `rangeWindow()`, `startOfPeriod()`, `dayIn()`) take the day counts and do the calendar arithmetic, so they're tested without a database.

## The setup checklist

`GET /api/dashboard/setup-checklist` lists the steps a new site should take, each `{ id, label, description?, href?, manual, done }`, in order:

| Order | Step | Done when |
| --- | --- | --- |
| 100 | Name your site | The site title isn't "Inithium" (the default) |
| 200 | Add your logo | A logo is set |
| 300 | Add a logo for dark mode | A dark mode logo is set, or dark mode is off |
| 400 | Add your favicon | A favicon is uploaded; Inithium's bundled default doesn't count |
| 500 | Set your brand colours | A theme is set |
| 600 | Choose your fonts | A display or body font is chosen |
| 700 | Name the copyright holder | The copyright holder is set and isn't "Inithium" (the default) |
| 800 | Review the privacy policy | Ticked by hand |
| 900 | Design the Home page | Ticked by hand |

- **Inithium's defaults never count as done:** a new site's title and copyright holder are "Inithium" and it shows Inithium's favicon, so those steps start unticked.
- **Detected steps** are read from data every time the checklist loads, so they tick and untick themselves. A check that throws shows the step as not done and logs a warning, rather than breaking the list.
- **Steps ticked by hand** (`manual: true`) are ticked for the whole site with `PUT /api/dashboard/setup-checklist/:id` and `{ done }`. The tick is a record in `setup_checklist_ticks` saying who ticked it. A detected step is refused with 400 (`field: 'done'`), an unknown one with 404. The answer is the whole checklist again.
- `href` is a CMS path (e.g. `/settings`); the widget's arrow opens it.

### Adding a step

Plugins and `libs/client/` add steps through the **setup checklist slot**: a `SetupChecklistItem` in `registeredSetupChecklistItems` in the api's registry (`apps/api/src/app/plugins.registry.ts`, shipped empty), which `main.ts` passes to `createDashboardRouter()`.

```ts
import type { SetupChecklistItem } from '@inithium/api-dashboards';

export const paymentsStep: SetupChecklistItem = {
  id: 'plugin-shop:payments',
  label: 'Set up payments',
  description: 'Connect a payment provider so customers can check out.',
  href: '/shop/settings',
  order: 1000,
  // Leave isDone out for a step that can't be detected: owners and admins then tick it by hand.
  isDone: async () => (await ShopSettingsModel.exists({ paymentsReady: true })) !== null,
};
```

- **`id`** is unique, and a plugin's are `plugin-<name>:<step>`. Two steps with one id (including one of core's) throw, and the api registry's spec checks this.
- **`order`** places it among core's (100–900).

## API

| Route | Permission | Does |
| --- | --- | --- |
| `GET /api/dashboard/me` | `cms.access` | The user's widgets, or `{ widgets: null }` for the default dashboard |
| `PUT /api/dashboard/me` | `cms.access` | Replaces the user's widgets: `{ widgets }` |
| `GET /api/dashboard/members` | `users.view` | The Members series: `?range=&tz=` |
| `GET /api/dashboard/setup-checklist` | `settings.edit` | The checklist with each step's state |
| `PUT /api/dashboard/setup-checklist/:id` | `settings.edit` | Ticks or unticks a step ticked by hand: `{ done }` |

The CMS calls them through `@inithium/shared-data-access` (`useGetMyDashboardQuery`, `useSaveMyDashboardMutation`, which updates the dashboard at once and goes back if saving fails, `useGetMemberGrowthQuery`, `useGetSetupChecklistQuery`, `useTickSetupChecklistItemMutation`).
