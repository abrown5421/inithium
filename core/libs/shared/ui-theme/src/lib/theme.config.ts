import type { NavbarLogo, ThemeConfig } from '@inithium/shared-contracts';

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
