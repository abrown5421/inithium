import type { SiteSettings, SiteSettingsInput, ThemeConfig } from '@inithium/shared-contracts';
import { SettingsModel, SITE_SETTINGS_KEY, type SettingsDocument } from './settings.model';

/** The settings a new site starts with (decision 0082). */
export const DEFAULT_SITE_SETTINGS: SiteSettingsInput = { siteTitle: 'Inithium' };

/** Maps the stored settings to the shape the API returns. */
export function toSiteSettings(doc: SettingsDocument): SiteSettings {
  return {
    siteTitle: doc.siteTitle,
    ...(doc.logo?.assetId ? { logo: { assetId: doc.logo.assetId, alt: doc.logo.alt ?? '' } } : {}),
    ...(doc.copyright ? { copyright: doc.copyright } : {}),
    ...(doc.theme?.colors ? { theme: { colors: doc.theme.colors as ThemeConfig['colors'] } } : {}),
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
  doc.set('theme', input.theme ?? undefined);
  return doc.save();
}
