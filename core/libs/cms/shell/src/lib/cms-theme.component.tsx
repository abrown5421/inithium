import { assetUrl } from '@inithium/shared-contracts';
import { useGetSiteQuery } from '@inithium/shared-data-access';
import { ThemeFonts, ThemeStyles, useFavicon } from '@inithium/shared-ui-theme';

/**
 * The client's theme, fonts and favicon from site settings (decisions 0087, 0101, 0111), overriding UiProvider's
 * default theme and fonts and the default favicon so the CMS looks like the client's own. Render it once at the app's
 * root; it updates as soon as Settings are saved.
 */
export function CmsTheme() {
  const { data: site } = useGetSiteQuery();
  useFavicon(site?.settings.favicon ? assetUrl(site.settings.favicon.assetId) : undefined);
  if (!site) return null;
  return (
    <>
      {site.settings.theme && <ThemeStyles theme={site.settings.theme} />}
      <ThemeFonts families={site.fontFamilies} fonts={site.settings.fonts} />
    </>
  );
}
