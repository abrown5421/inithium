import type { ReactNode } from 'react';
import { Container } from '@inithium/shared-ui-components';
import { Footer, type FooterProps } from '@inithium/shared-ui-composites';

export type DefaultLayoutProps = {
  /** The page's content. */
  children?: ReactNode;
  /** The Footer under the content; leave it out for none. */
  footer?: FooterProps;
};

/**
 * The standard page frame under the Navbar (decision 0079): the content centred at up to 1200px wide with 24px
 * sides and 32px above and below, filling the height so the Footer sits at the bottom of short pages.
 */
export function DefaultLayout({ children, footer }: DefaultLayoutProps) {
  return (
    <Container flex={{ direction: 'column', align: 'center' }} flexItem={{ grow: 1 }} width="full">
      <Container as="main" flexItem={{ grow: 1 }} width="full" maxWidth={1200} padding={{ x: 24, y: 32 }}>
        {children}
      </Container>
      {footer && <Footer {...footer} />}
    </Container>
  );
}
