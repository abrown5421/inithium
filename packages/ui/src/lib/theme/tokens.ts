type Scale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
  base: string;
};

const scale = (name: string): Scale => ({
  50: `var(--color-${name}-50)`,
  100: `var(--color-${name}-100)`,
  200: `var(--color-${name}-200)`,
  300: `var(--color-${name}-300)`,
  400: `var(--color-${name}-400)`,
  500: `var(--color-${name}-500)`,
  600: `var(--color-${name}-600)`,
  700: `var(--color-${name}-700)`,
  800: `var(--color-${name}-800)`,
  900: `var(--color-${name}-900)`,
  950: `var(--color-${name}-950)`,
  base: `var(--color-${name}-500)`,
});

export const themeTokens = {
  colors: {
    primary: scale("primary"),
    secondary: scale("secondary"),
    accent: scale("accent"),
    success: scale("success"),
    warning: scale("warning"),
    danger: scale("danger"),
    info: scale("info"),
    surface: scale("surface"),
    surface2: scale("surface2"),
    surface3: scale("surface3"),
    surface4: scale("surface4"),
  },

  fonts: {
    display: "var(--font-display)",
    body: "var(--font-body)",
    mono: "var(--font-mono)",
  },

  fontCatalogue: {
    interTight: '"Inter Tight"',
    plusJakartaSans: '"Plus Jakarta Sans"',
    sora: '"Sora"',
    dmSans: '"DM Sans"',
    spaceGrotesk: '"Space Grotesk"',
    nunito: '"Nunito"',
    raleway: '"Raleway"',
    mulish: '"Mulish"',
    outfit: '"Outfit"',
    manrope: '"Manrope"',
    barlow: '"Barlow"',
    epilogue: '"Epilogue"',
    josefinSans: '"Josefin Sans"',
    lora: '"Lora"',
    merriweather: '"Merriweather"',
    playfairDisplay: '"Playfair Display"',
    fraunces: '"Fraunces"',
    libreBaskerville: '"Libre Baskerville"',
    ibmPlexMono: '"IBM Plex Mono"',
    spaceMono: '"Space Mono"',
  },
} as const;

export type ThemeTokens = typeof themeTokens;
export type FontRole = keyof typeof themeTokens.fonts;
export type FontCatalogueKey = keyof typeof themeTokens.fontCatalogue;
