import type { z } from 'zod';
import type {
  dashboardWidgetSchema,
  dashboardWidgetWidthSchema,
  memberGrowthPointSchema,
  memberGrowthQuerySchema,
  memberGrowthRangeSchema,
  memberGrowthSchema,
  memberGrowthUnitSchema,
  myDashboardSchema,
  saveDashboardRequestSchema,
  setupChecklistItemSchema,
  setupChecklistSchema,
  tickSetupChecklistItemSchema,
} from './dashboard.schema';

export type DashboardWidgetWidth = z.infer<typeof dashboardWidgetWidthSchema>;
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;
export type SaveDashboardRequest = z.infer<typeof saveDashboardRequestSchema>;
export type MyDashboard = z.infer<typeof myDashboardSchema>;
export type MemberGrowthRange = z.infer<typeof memberGrowthRangeSchema>;
export type MemberGrowthUnit = z.infer<typeof memberGrowthUnitSchema>;
export type MemberGrowthQuery = z.infer<typeof memberGrowthQuerySchema>;
export type MemberGrowthPoint = z.infer<typeof memberGrowthPointSchema>;
export type MemberGrowth = z.infer<typeof memberGrowthSchema>;
export type SetupChecklistItemStatus = z.infer<typeof setupChecklistItemSchema>;
export type SetupChecklist = z.infer<typeof setupChecklistSchema>;
export type TickSetupChecklistItemRequest = z.infer<typeof tickSetupChecklistItemSchema>;
