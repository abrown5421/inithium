import { dashboardWidgetsSchema, type DashboardWidget, type MyDashboard } from '@inithium/shared-contracts';
import { DashboardModel } from './dashboards.model';

/** The user's saved dashboard, or `widgets: null` while they're still on the default one (decision 0120). */
export async function getMyDashboard(userId: string): Promise<MyDashboard> {
  const doc = await DashboardModel.findOne({ userId }).lean();
  // Parsed, so a record written by an older shape never reaches the CMS unchecked.
  const parsed = doc ? dashboardWidgetsSchema.safeParse(doc.widgets) : null;
  return { widgets: parsed?.success ? parsed.data : null };
}

/** Replaces the user's dashboard with these widgets, already checked against the contract. */
export async function saveMyDashboard(userId: string, widgets: DashboardWidget[]): Promise<MyDashboard> {
  await DashboardModel.updateOne({ userId }, { $set: { widgets } }, { upsert: true });
  return { widgets };
}

/** Deletes these accounts' dashboards, when the accounts are deleted (decision 0100). Safe to repeat. */
export async function deleteDashboardsOfUsers(userIds: string[]): Promise<void> {
  await DashboardModel.deleteMany({ userId: { $in: userIds } });
}
