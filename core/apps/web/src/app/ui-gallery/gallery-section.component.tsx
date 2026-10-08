import type { ReactNode } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';

/** A titled block on a gallery page. */
export function GallerySection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Container as="section" flex={{ direction: 'column', gap: 16 }} padding={{ y: 24 }}>
      <Container flex={{ direction: 'column', gap: 4 }}>
        <Text as="h2" fontSize={20} fontWeight={700} textColor={{ color: 'surface', intensity: 900 }}>
          {title}
        </Text>
        {description && <Text textColor={{ color: 'surface', intensity: 700 }}>{description}</Text>}
      </Container>
      {children}
    </Container>
  );
}

/** A gallery page: a heading, an intro and its sections. */
export function GalleryPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <Container flex={{ direction: 'column', gap: 8 }}>
      <Text as="h1" fontFamily="display" fontSize={{ base: 28, md: 36 }} textColor="primary">
        {title}
      </Text>
      <Text fontSize={17} maxWidth={720} textColor={{ color: 'surface', intensity: 700 }}>
        {intro}
      </Text>
      {children}
    </Container>
  );
}
