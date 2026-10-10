import { Router } from 'express';
import { siteSettingsInputSchema } from '@inithium/shared-contracts';
import { requirePermission } from '@inithium/api-auth';
import { getSiteSettings, toSiteSettings, updateSiteSettings } from './settings.service';

/** Mounted at /api/settings: the CMS reads and replaces the site settings (decision 0082). */
export const settingsRouter = Router();

settingsRouter.get('/', ...requirePermission('settings.edit'), async (_req, res) => {
  res.send(toSiteSettings(await getSiteSettings()));
});

settingsRouter.put('/', ...requirePermission('settings.edit'), async (req, res) => {
  const parsed = siteSettingsInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send({ message: 'Check the settings and try again', issues: parsed.error.issues });
    return;
  }
  res.send(toSiteSettings(await updateSiteSettings(parsed.data)));
});
