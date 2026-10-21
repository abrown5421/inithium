import { z } from 'zod';

/** How much of the dashboard's row a widget takes (decision 0120). */
export const dashboardWidgetWidths = ['1/4', '1/3', '2/3', 'full'] as const;
export const dashboardWidgetWidthSchema = z.enum(dashboardWidgetWidths);

/** At most this many widgets on one dashboard. */
export const MAX_DASHBOARD_WIDGETS = 32;
/** A widget's stored settings, as JSON, are at most this many characters. */
export const MAX_DASHBOARD_WIDGET_SETTINGS = 4000;

/**
 * One widget on a user's dashboard. `type` names its definition in the CMS (core's, e.g. `member-growth`, or a
 * plugin's `plugin-<name>:<widget>`); `settings` are the widget's own, checked by its definition in the CMS.
 */
export const dashboardWidgetSchema = z
  .object({
    id: z.string().regex(/^[\w-]{1,64}$/),
    type: z.string().regex(/^[a-z0-9-]+(:[a-z0-9-]+)?$/).max(100),
    width: dashboardWidgetWidthSchema,
    settings: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .refine((widget) => JSON.stringify(widget.settings).length <= MAX_DASHBOARD_WIDGET_SETTINGS, {
    error: 'Widget settings are too large',
    path: ['settings'],
  });

/** A dashboard's widgets, in order; ids are unique. */
export const dashboardWidgetsSchema = z
  .array(dashboardWidgetSchema)
  .max(MAX_DASHBOARD_WIDGETS, { error: `A dashboard holds at most ${MAX_DASHBOARD_WIDGETS} widgets` })
  .refine((widgets) => new Set(widgets.map((widget) => widget.id)).size === widgets.length, { error: 'Widget ids must be unique' });

/** `PUT /api/dashboard/me`: the signed-in user's whole dashboard. */
export const saveDashboardRequestSchema = z.object({ widgets: dashboardWidgetsSchema }).strict();

/** `GET /api/dashboard/me`: the saved widgets, or null while the user is still on the default dashboard. */
export const myDashboardSchema = z.object({ widgets: dashboardWidgetsSchema.nullable() });

/** The Members widget's ranges, from the past week to all time. */
export const memberGrowthRanges = ['week', 'month', 'quarter', 'half-year', 'year', 'all'] as const;
export const memberGrowthRangeSchema = z.enum(memberGrowthRanges);

/** How the series is grouped: by day, by week (from Monday) or by month. */
export const memberGrowthUnitSchema = z.enum(['day', 'week', 'month']);

/** `GET /api/dashboard/members`: the range and the viewer's time zone (an IANA name, e.g. 'Europe/London'). */
export const memberGrowthQuerySchema = z.object({
  range: memberGrowthRangeSchema.default('month'),
  tz: z.string().trim().min(1).max(64).default('UTC'),
});

/** One point of the series: the period's first day (`YYYY-MM-DD`), members who joined in it, and the total by its end. */
export const memberGrowthPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  joined: z.number().int().min(0),
  total: z.number().int().min(0),
});

/** Members (`user` accounts, staff left out) by join date (decision 0120). Deleted accounts aren't counted. */
export const memberGrowthSchema = z.object({
  range: memberGrowthRangeSchema,
  unit: memberGrowthUnitSchema,
  /** Members today. */
  total: z.number().int().min(0),
  /** Members who joined within the range. */
  joined: z.number().int().min(0),
  points: memberGrowthPointSchema.array(),
});

/** One step of the setup checklist (decision 0120), done automatically from data or ticked by hand (`manual`). */
export const setupChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  /** Where in the CMS to do it, e.g. '/settings'. */
  href: z.string().optional(),
  manual: z.boolean(),
  done: z.boolean(),
});

/** `GET /api/dashboard/setup-checklist`. */
export const setupChecklistSchema = z.object({ items: setupChecklistItemSchema.array() });

/** `PUT /api/dashboard/setup-checklist/:id`: ticks or unticks a step that's ticked by hand. */
export const tickSetupChecklistItemSchema = z.object({ done: z.boolean() }).strict();
