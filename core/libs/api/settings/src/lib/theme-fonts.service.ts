import { fontsVersion, listFontFamilies, toSiteFontFamily } from '@inithium/api-fonts';
import { themeFontPreloads, themeFontsCss } from '@inithium/shared-contracts';
import { getSiteSettings, toSiteSettings } from './settings.service';

let cached: { version: number; head: string } | undefined;

/**
 * What the api writes into each app's `<head>` (decision 0114): a preload for each theme font's main file, then the
 * theme's font CSS (every library family's `@font-face` rules, size-matched fallbacks, and `--font-display` /
 * `--font-body`). Rebuilt only when the library or the theme's fonts change.
 */
export async function themeFontsHead(): Promise<string> {
  const version = fontsVersion();
  if (cached?.version === version) return cached.head;

  const [settings, families] = await Promise.all([getSiteSettings(), listFontFamilies()]);
  const siteFamilies = families.map(toSiteFontFamily);
  const fonts = toSiteSettings(settings).fonts;
  const css = themeFontsCss(siteFamilies, fonts);
  const preloads = themeFontPreloads(siteFamilies, fonts).map(
    // Fonts are fetched in CORS mode, so the preload must be too, or the browser downloads the file twice.
    (file) => `<link rel="preload" href="${file.url}" as="font" type="${file.contentType}" crossorigin>`,
  );
  const head = [...preloads, ...(css ? [`<style id="inithium-theme-fonts">${css}</style>`] : [])].join('');
  cached = { version, head };
  return head;
}

/**
 * An app's built `index.html` with the theme's fonts in its `<head>` (decision 0114), so the first paint already uses
 * the client's fonts. If they can't be read (e.g. the database is down), the page is sent as built.
 */
export async function renderAppPage(template: string): Promise<string> {
  try {
    const head = await themeFontsHead();
    return head ? template.replace('</head>', `${head}</head>`) : template;
  } catch (error) {
    console.warn('[ theme fonts ] page sent without them:', (error as Error).message);
    return template;
  }
}
