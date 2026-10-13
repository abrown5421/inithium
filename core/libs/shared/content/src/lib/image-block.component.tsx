import { useState } from 'react';
import { assetUrl, type ImageBlock } from '@inithium/shared-contracts';
import { Container, Icon, Image, Text } from '@inithium/shared-ui-components';
import { useContentLinks } from './content-links.context';

const ALIGN_ITEMS = { start: 'start', center: 'center', end: 'end' } as const;

/**
 * The Image block (decision 0098): an uploaded image by its asset id, at full column width or capped, aligned, with
 * rounded corners, an optional caption and an optional link. A missing image (deleted, or not chosen yet) shows a
 * placeholder rather than a broken picture.
 */
export function ImageBlockView({ block }: { block: ImageBlock }) {
  const resolve = useContentLinks();
  const [failedId, setFailedId] = useState<string | null>(null);
  const missing = !block.assetId || failedId === block.assetId;
  const width = block.width === undefined || block.width === 'full' ? ('full' as const) : block.width;
  const radius = { all: block.radius ?? 0 };

  const picture = missing ? (
    <Container
      width={width}
      maxWidth="full"
      height={160}
      flex={{ direction: 'column', align: 'center', justify: 'center', gap: 8 }}
      radius={radius}
      bgColor={{ color: 'surface', intensity: 200 }}
      textColor={{ color: 'surface', intensity: 700 }}
      role={block.decorative ? undefined : 'img'}
      aria-label={block.decorative ? undefined : (block.alt ?? 'Image')}
      aria-hidden={block.decorative || undefined}
    >
      <Icon name="image-off" size={28} />
      <Text as="span" fontSize={13}>
        {block.assetId ? 'This image is missing' : 'No image chosen'}
      </Text>
    </Container>
  ) : (
    <Image
      src={assetUrl(block.assetId)}
      alt={block.alt}
      decorative={block.decorative}
      width={width}
      radius={radius}
      onError={() => setFailedId(block.assetId)}
    />
  );
  const link = block.link && !missing ? resolve(block.link) : undefined;

  return (
    <Container flex={{ direction: 'column', align: ALIGN_ITEMS[block.align ?? 'center'], gap: 8 }}>
      {link?.href ? (
        // A plain <a> around the image: no component renders an anchor that wraps content (decision 0092).
        <a href={link.href} onClick={link.onClick} {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} style={{ display: 'block', maxWidth: '100%' }}>
          {picture}
        </a>
      ) : (
        picture
      )}
      {block.caption && (
        <Text as="span" fontSize={14} lineHeight={1.5} align={block.align ?? 'center'} textColor={{ color: 'surface', intensity: 700 }}>
          {block.caption}
        </Text>
      )}
    </Container>
  );
}
