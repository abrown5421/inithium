import type { ReactNode } from 'react';
import { Container } from '@inithium/shared-ui-components';

export type BareLayoutProps = {
  /** The page's content, e.g. a sign-in form. */
  children?: ReactNode;
};

/**
 * A focused page frame under the Navbar (decision 0079), for sign-in and similar pages: the content in a card up to
 * 420px wide, centred in the space below the Navbar, with no Footer.
 */
export function BareLayout({ children }: BareLayoutProps) {
  return (
    <Container flex={{ direction: 'column', align: 'center', justify: 'center' }} flexItem={{ grow: 1 }} width="full" padding={{ all: 24 }}>
      <Container
        as="main"
        width="full"
        maxWidth={420}
        padding={{ all: 32 }}
        radius={{ all: 12 }}
        bgColor={{ color: 'surface', intensity: 50 }}
        borderWidth={{ all: 1 }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}
        shadow="md"
      >
        {children}
      </Container>
    </Container>
  );
}
