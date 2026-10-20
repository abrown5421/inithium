import { logoImage, type NavbarLogo, type ThemeConfig } from '@inithium/shared-contracts';
import type { ResolvedColorScheme } from './color-scheme.service';

/** Core's default theme, used until a client sets their own. Brand colours are 500s; surface is its 100. */
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#006a8e',
    secondary: '#397e7f',
    tertiary: '#64748b',
    quaternary: '#25374f',
    accent: '#f5a42d',
    surface: '#f8fafc',
  },
};

/**
 * Core's default logo (decision 0087), used wherever the site has none set in settings: the Navbar and the CMS's
 * top bar. Bundled by each app (178 x 160, drawn 40px tall).
 */
export const defaultLogo: NavbarLogo = {
  src: new URL('../assets/inithium-logo.png', import.meta.url).href,
  alt: 'Inithium',
};

/** Core's default logo in dark mode (decision 0119), drawn for light-on-dark. Same size as `defaultLogo`. */
export const defaultLogoDark: NavbarLogo = {
  src: new URL('../assets/inithium-logo-dark.png', import.meta.url).href,
  alt: 'Inithium',
};

/**
 * The logo to draw in a colour scheme (decisions 0087, 0119). Dark mode uses the site's dark logo, else its own logo,
 * and only without either Inithium's dark one; light mode uses the site's logo or Inithium's.
 */
export function siteLogo(
  settings: { logo?: { assetId: string; alt: string }; logoDark?: { assetId: string; alt: string } },
  scheme: ResolvedColorScheme,
): NavbarLogo {
  if (scheme === 'dark') {
    const logo = settings.logoDark ?? settings.logo;
    return logo ? logoImage(logo) : defaultLogoDark;
  }
  return settings.logo ? logoImage(settings.logo) : defaultLogo;
}
