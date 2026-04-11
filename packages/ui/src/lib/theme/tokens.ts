/**
 * Design token map — mirrors the CSS @theme scale exactly.
 *
 * Each color has a full 50–950 scale plus a `base` alias for the 500 anchor.
 * Use these when you need a token value in JS/TS (e.g. inline styles, canvas,
 * charting libs). For everything else, use Tailwind utilities directly:
 *
 *   text-primary-300   bg-danger-500/80   border-accent-200
 */

type Scale = {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string; 950: string;
  /** Alias for the 500 (base) shade */
  base: string;
};

const scale = (name: string): Scale => ({
  50:   `var(--color-${name}-50)`,
  100:  `var(--color-${name}-100)`,
  200:  `var(--color-${name}-200)`,
  300:  `var(--color-${name}-300)`,
  400:  `var(--color-${name}-400)`,
  500:  `var(--color-${name}-500)`,
  600:  `var(--color-${name}-600)`,
  700:  `var(--color-${name}-700)`,
  800:  `var(--color-${name}-800)`,
  900:  `var(--color-${name}-900)`,
  950:  `var(--color-${name}-950)`,
  base: `var(--color-${name}-500)`,
});

export const themeTokens = {
  colors: {
    primary:   scale('primary'),
    secondary: scale('secondary'),
    accent:    scale('accent'),
    success:   scale('success'),
    warning:   scale('warning'),
    danger:    scale('danger'),
    info:      scale('info'),
    surface:   scale('surface'),
    surface2:  scale('surface2'),
    surface3:  scale('surface3'),
    surface4:  scale('surface4'),
  },
} as const;

export type ThemeTokens = typeof themeTokens;
