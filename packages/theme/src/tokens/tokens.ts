import type { TokenMap } from '../types/theme.types.js';

export const tokens: TokenMap = {
  // Brand
  primary: 'var(--color-primary)',
  primaryForeground: 'var(--color-primary-foreground)',
  secondary: 'var(--color-secondary)',
  secondaryForeground: 'var(--color-secondary-foreground)',
  accent: 'var(--color-accent)',
  accentForeground: 'var(--color-accent-foreground)',

  // Surface
  background: 'var(--color-background)',
  foreground: 'var(--color-foreground)',
  card: 'var(--color-card)',
  cardForeground: 'var(--color-card-foreground)',
  popover: 'var(--color-popover)',
  popoverForeground: 'var(--color-popover-foreground)',
  muted: 'var(--color-muted)',
  mutedForeground: 'var(--color-muted-foreground)',

  // Functional
  border: 'var(--color-border)',
  input: 'var(--color-input)',
  ring: 'var(--color-ring)',

  // Status
  destructive: 'var(--color-destructive)',
  destructiveForeground: 'var(--color-destructive-foreground)',
  success: 'var(--color-success)',
  successForeground: 'var(--color-success-foreground)',
  warning: 'var(--color-warning)',
  warningForeground: 'var(--color-warning-foreground)',

  // Radius
  radiusSm: 'var(--radius-sm)',
  radiusMd: 'var(--radius-md)',
  radiusLg: 'var(--radius-lg)',
  radiusFull: 'var(--radius-full)',
};

