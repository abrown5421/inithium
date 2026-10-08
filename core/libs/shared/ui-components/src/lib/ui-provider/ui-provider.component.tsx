import type { ReactNode } from 'react';
import type { ThemeConfig } from '@inithium/shared-contracts';
import { ThemeStyles } from '@inithium/shared-ui-theme';
import { inputStyleSheet } from '../input/input.styles';
import { buildStyleSheet } from '../style-props/style-sheet.service';

// The stylesheets never change at runtime, so they're built once. Component stylesheets come first, so style
// props (e.g. padding) win over them.
const styleSheet = inputStyleSheet + buildStyleSheet();

/**
 * Wrap each app's root in this. It publishes the theme's colour scales, the stylesheet every style prop relies
 * on, and the fixed component stylesheets (Input's).
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
