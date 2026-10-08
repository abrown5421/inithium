import type { ReactNode } from 'react';
import type { ThemeConfig } from '@inithium/shared-contracts';
import { ThemeStyles } from '@inithium/shared-ui-theme';
import { checkboxStyleSheet } from '../checkbox/checkbox.styles';
import { inputStyleSheet } from '../input/input.styles';
import { loaderStyleSheet } from '../loader/loader.styles';
import { buildStyleSheet } from '../style-props/style-sheet.service';

// The stylesheets never change at runtime, so they're built once. Component stylesheets come first, so style
// props (e.g. padding) win over them.
const styleSheet = checkboxStyleSheet + inputStyleSheet + loaderStyleSheet + buildStyleSheet();

/**
 * Wrap each app's root in this. It publishes the theme's colour scales, the stylesheet every style prop relies
 * on, and the fixed component stylesheets (Checkbox's, Input's and Loader's).
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
