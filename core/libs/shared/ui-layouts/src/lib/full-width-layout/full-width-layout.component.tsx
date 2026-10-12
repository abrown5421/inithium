import type { CSSProperties, ReactNode } from 'react';
import { Container } from '@inithium/shared-ui-components';
import { Footer, type FooterProps } from '@inithium/shared-ui-composites';
import { NAVBAR_HEIGHT_VAR } from '../default-layout/default-layout.component';

// As DefaultLayout: at least the screen's height minus the Navbar, so the Footer starts just below the fold.
const ABOVE_THE_FOLD: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  width: '100%',
  minHeight: `calc(100dvh - var(${NAVBAR_HEIGHT_VAR}))`,
};

export type FullWidthLayoutProps = {
  /** The page's content, from edge to edge. */
  children?: ReactNode;
  /** The Footer under the content; leave it out for none. */
  footer?: FooterProps;
};

/**
 * A page frame under the Navbar with no width limit or padding (decision 0090), for pages that draw their own
 * frame, such as the profile's full-width banner. Like DefaultLayout, the Footer starts just below the fold.
 */
export function FullWidthLayout({ children, footer }: FullWidthLayoutProps) {
  return (
    <Container flex={{ direction: 'column' }} flexItem={{ grow: 1 }} width="full">
      <div style={ABOVE_THE_FOLD}>
        <Container as="main" flex={{ direction: 'column' }} flexItem={{ grow: 1 }} width="full">
          {children}
        </Container>
      </div>
      {footer && <Footer {...footer} />}
    </Container>
  );
}
