import type { SiteSettings, SiteSettingsInput } from '@inithium/shared-contracts';
import { SettingsModel, SITE_SETTINGS_KEY, type SettingsDocument } from './settings.model';

/** The settings a new site starts with (decision 0082). */
export const DEFAULT_SITE_SETTINGS: SiteSettingsInput = { siteTitle: 'My site' };

/** Maps the stored settings to the shape the API returns. */
export function toSiteSettings(doc: SettingsDocument): SiteSettings {
  return {
    siteTitle: doc.siteTitle,
    ...(doc.logo ? { logo: { src: doc.logo.src, alt: doc.logo.alt ?? '' } } : {}),
    ...(doc.copyright ? { copyright: doc.copyright } : {}),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** The site's settings, creating the defaults if none exist yet. */
export async function getSiteSettings(): Promise<SettingsDocument> {
  return (
    (await SettingsModel.findOne({ key: SITE_SETTINGS_KEY })) ??
    SettingsModel.create({ key: SITE_SETTINGS_KEY, ...DEFAULT_SITE_SETTINGS })
  );
}

/** Replaces the settings with a validated input; fields left out are cleared. */
export async function updateSiteSettings(input: SiteSettingsInput): Promise<SettingsDocument> {
  const doc = await getSiteSettings();
  doc.siteTitle = input.siteTitle;
  doc.set('logo', input.logo ?? undefined);
  doc.set('copyright', input.copyright ?? undefined);
  return doc.save();
}
