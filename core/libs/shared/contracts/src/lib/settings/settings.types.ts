import type { z } from 'zod';
import type { siteBundleSchema, siteSettingsInputSchema, siteSettingsSchema } from './settings.schema';

export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type SiteBundle = z.infer<typeof siteBundleSchema>;
