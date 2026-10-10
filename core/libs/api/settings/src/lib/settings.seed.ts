import { SettingsModel, SITE_SETTINGS_KEY } from './settings.model';
import { DEFAULT_SITE_SETTINGS } from './settings.service';

/** Creates the default site settings if none exist. Runs on every api startup and never changes existing settings. */
export async function seedSiteSettings(): Promise<void> {
  if (await SettingsModel.exists({ key: SITE_SETTINGS_KEY })) return;
  await SettingsModel.create({ key: SITE_SETTINGS_KEY, ...DEFAULT_SITE_SETTINGS });
  console.log('[ seed ] created default site settings');
}
