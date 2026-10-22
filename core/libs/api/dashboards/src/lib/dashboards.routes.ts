import { Router } from 'express';
import { memberGrowthQuerySchema, saveDashboardRequestSchema, tickSetupChecklistItemSchema } from '@inithium/shared-contracts';
import { getAuth, requirePermission } from '@inithium/api-auth';
import { getMyDashboard, saveMyDashboard } from './dashboards.service';
import { isTimeZone, memberGrowth } from './member-growth.service';
import { setupChecklist, tickSetupChecklistItem } from './setup-checklist.service';
import type { SetupChecklistItem } from './setup-checklist.types';

export type DashboardRouterOptions = {
  /** Setup checklist steps from installed plugins and libs/client, from the api's registry. */
  setupChecklistItems: readonly SetupChecklistItem[];
};

/** Mounted at /api/dashboard: the CMS dashboard's layouts and core widgets' data (decision 0120). */
export function createDashboardRouter({ setupChecklistItems }: DashboardRouterOptions): Router {
  const router = Router();

  /** The signed-in user's dashboard; `widgets: null` means the default one. */
  router.get('/me', ...requirePermission('cms.access'), async (_req, res) => {
    res.send(await getMyDashboard(getAuth(res).sub));
  });

  /** Replaces the signed-in user's dashboard. */
  router.put('/me', ...requirePermission('cms.access'), async (req, res) => {
    const parsed = saveDashboardRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: 'The dashboard couldn’t be saved', issues: parsed.error.issues });
      return;
    }
    res.send(await saveMyDashboard(getAuth(res).sub, parsed.data.widgets));
  });

  /** Members by join date over a range, grouped in the viewer's time zone (the Members widget). */
  router.get('/members', ...requirePermission('users.view'), async (req, res) => {
    const parsed = memberGrowthQuerySchema.safeParse(req.query);
    if (!parsed.success || !isTimeZone(parsed.data.tz)) {
      res.status(400).send({ message: 'Choose a range and a time zone', field: parsed.success ? 'tz' : 'range' });
      return;
    }
    res.send(await memberGrowth(parsed.data.range, parsed.data.tz));
  });

  /** The setup checklist (the Setup checklist widget). */
  router.get('/setup-checklist', ...requirePermission('settings.edit'), async (_req, res) => {
    res.send(await setupChecklist(setupChecklistItems));
  });

  /** Ticks or unticks a step that's ticked by hand, for the whole site. */
  router.put('/setup-checklist/:id', ...requirePermission('settings.edit'), async (req, res) => {
    const parsed = tickSetupChecklistItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: 'Say whether the step is done', field: 'done' });
      return;
    }
    await tickSetupChecklistItem(setupChecklistItems, String(req.params['id']), parsed.data.done, getAuth(res).sub);
    res.send(await setupChecklist(setupChecklistItems));
  });

  return router;
}
