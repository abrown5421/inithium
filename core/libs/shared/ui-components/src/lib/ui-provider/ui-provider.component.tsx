import type { ReactNode } from 'react';
import type { ThemeConfig } from '@inithium/shared-contracts';
import { ThemeStyles } from '@inithium/shared-ui-theme';
import { checkboxStyleSheet } from '../checkbox/checkbox.styles';
import { dividerStyleSheet } from '../divider/divider.styles';
import { inputStyleSheet } from '../input/input.styles';
import { loaderStyleSheet } from '../loader/loader.styles';
import { radioGroupStyleSheet } from '../radio-group/radio-group.styles';
import { selectStyleSheet } from '../select/select.styles';
import { buildStyleSheet } from '../style-props/style-sheet.service';
import { switchStyleSheet } from '../switch/switch.styles';

// The stylesheets never change at runtime, so they're built once. Component stylesheets come first, so style
// props (e.g. padding) win over them.
const styleSheet = checkboxStyleSheet + dividerStyleSheet + inputStyleSheet + loaderStyleSheet + radioGroupStyleSheet + selectStyleSheet + switchStyleSheet + buildStyleSheet();

/**
 * Wrap each app's root in this. It publishes the theme's colour scales, the stylesheet every style prop relies
 * on, and the fixed component stylesheets (Checkbox's, Divider's, Input's, Loader's, RadioGroup's, Select's and Switch's).
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
