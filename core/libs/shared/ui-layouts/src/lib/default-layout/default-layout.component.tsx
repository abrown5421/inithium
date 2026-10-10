import type { CSSProperties, ReactNode } from 'react';
import { Container } from '@inithium/shared-ui-components';
import { Footer, type FooterProps } from '@inithium/shared-ui-composites';

/** Set by the web shell to the Navbar's height (e.g. '65px'). Layouts use it to fill the screen below the Navbar. */
export const NAVBAR_HEIGHT_VAR = '--ui-navbar-height';

// At least the screen's height minus the Navbar, so the Footer starts just below the fold. Without the variable
// (outside the web shell) the calc is invalid, so the rule drops out and the content simply fills its frame.
const ABOVE_THE_FOLD: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexGrow: 1,
  width: '100%',
  minHeight: `calc(100dvh - var(${NAVBAR_HEIGHT_VAR}))`,
};

export type DefaultLayoutProps = {
  /** The page's content. */
  children?: ReactNode;
  /** The Footer under the content; leave it out for none. */
  footer?: FooterProps;
};

/**
 * The standard page frame under the Navbar (decision 0079): the content centred at up to 1200px wide with 24px
 * sides and 32px above and below. Under the web shell the content area is at least the screen's height minus the
 * Navbar, so the Footer starts just below the fold; longer content pushes it further down.
 */
export function DefaultLayout({ children, footer }: DefaultLayoutProps) {
  return (
    <Container flex={{ direction: 'column', align: 'center' }} flexItem={{ grow: 1 }} width="full">
      <div style={ABOVE_THE_FOLD}>
        <Container as="main" flexItem={{ grow: 1 }} width="full" maxWidth={1200} padding={{ x: 24, y: 32 }}>
          {children}
        </Container>
      </div>
      {footer && <Footer {...footer} />}
    </Container>
  );
}
