import { findFontFamily, markFontsChanged } from '@inithium/api-fonts';
import type { SiteSettings, SiteSettingsInput, ThemeConfig, ThemeFonts } from '@inithium/shared-contracts';
import { SettingsModel, SITE_SETTINGS_KEY, type SettingsDocument } from './settings.model';

const failure = (status: number, message: string, field?: string) => Object.assign(new Error(message), { status, field });

/** The theme fonts stored, without empty roles. */
function storedFonts(doc: SettingsDocument): ThemeFonts | undefined {
  const fonts = { ...(doc.fonts?.display ? { display: doc.fonts.display } : {}), ...(doc.fonts?.body ? { body: doc.fonts.body } : {}) };
  return Object.keys(fonts).length ? fonts : undefined;
}

/** The settings a new site starts with (decision 0082). */
export const DEFAULT_SITE_SETTINGS: SiteSettingsInput = { siteTitle: 'Inithium', darkMode: true };

/** Maps the stored settings to the shape the API returns. */
export function toSiteSettings(doc: SettingsDocument): SiteSettings {
  return {
    siteTitle: doc.siteTitle,
    ...(doc.logo?.assetId ? { logo: { assetId: doc.logo.assetId, alt: doc.logo.alt ?? '' } } : {}),
    ...(doc.logoDark?.assetId ? { logoDark: { assetId: doc.logoDark.assetId, alt: doc.logoDark.alt ?? '' } } : {}),
    ...(doc.favicon?.assetId ? { favicon: { assetId: doc.favicon.assetId } } : {}),
    ...(doc.copyright ? { copyright: doc.copyright } : {}),
    ...(doc.theme?.colors ? { theme: { colors: doc.theme.colors as ThemeConfig['colors'] } } : {}),
    ...(storedFonts(doc) ? { fonts: storedFonts(doc) } : {}),
    darkMode: doc.darkMode !== false,
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

/** The theme roles a font family is used for, e.g. ['display'] (decision 0111). */
export async function fontRolesUsing(familyId: string): Promise<('display' | 'body')[]> {
  const fonts = (await getSiteSettings()).fonts;
  return (['display', 'body'] as const).filter((role) => fonts?.[role] === familyId);
}

/** Checks each theme font is a family in the library with at least one file (400 naming the field otherwise). */
async function checkThemeFonts(fonts: ThemeFonts | undefined): Promise<void> {
  for (const role of ['display', 'body'] as const) {
    const id = fonts?.[role];
    if (!id) continue;
    const family = await findFontFamily(id);
    if (!family) throw failure(400, 'That font family is no longer in the library', `fonts.${role}`);
    if (!family.files.length) throw failure(400, `${family.name} has no files. Add one in Media first.`, `fonts.${role}`);
  }
}

/** Replaces the settings with a validated input; fields left out are cleared (`darkMode` left out means on). */
export async function updateSiteSettings(input: SiteSettingsInput): Promise<SettingsDocument> {
  await checkThemeFonts(input.fonts);
  const doc = await getSiteSettings();
  doc.siteTitle = input.siteTitle;
  doc.set('logo', input.logo ?? undefined);
  doc.set('logoDark', input.logoDark ?? undefined);
  doc.set('favicon', input.favicon ?? undefined);
  doc.set('copyright', input.copyright ?? undefined);
  doc.set('theme', input.theme ?? undefined);
  doc.set('fonts', input.fonts && (input.fonts.display || input.fonts.body) ? input.fonts : undefined);
  doc.darkMode = input.darkMode !== false;
  const saved = await doc.save();
  // Rebuilds what the api writes into each app page: the theme's fonts and whether dark mode is on.
  markFontsChanged();
  return saved;
}
