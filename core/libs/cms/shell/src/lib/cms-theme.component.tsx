import { useGetSiteQuery } from '@inithium/shared-data-access';
import { ThemeStyles } from '@inithium/shared-ui-theme';

/**
 * The client's theme from site settings (decision 0087), overriding UiProvider's default so the CMS looks like the
 * client's own. Render it once at the app's root; it updates as soon as Settings are saved.
 */
export function CmsTheme() {
  const { data: site } = useGetSiteQuery();
  return site?.settings.theme ? <ThemeStyles theme={site.settings.theme} /> : null;
}
