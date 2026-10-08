import type { ReactNode } from 'react';
import type { ThemeConfig } from '@inithium/shared-contracts';
import { ThemeStyles } from '@inithium/shared-ui-theme';
import { buildStyleSheet } from '../style-props/style-sheet.service';

// The style-prop stylesheet never changes at runtime, so it's built once.
const styleSheet = buildStyleSheet();

/**
 * Wrap each app's root in this. It publishes the theme's colour scales and the stylesheet every style prop
 * relies on.
 */
export function UiProvider({ theme, children }: { theme?: ThemeConfig; children: ReactNode }) {
  return (
    <>
      <ThemeStyles theme={theme} />
      <style>{styleSheet}</style>
      {children}
    </>
  );
}
