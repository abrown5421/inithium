import { useState } from 'react';
import { assetUrl, type ImageElementProps } from '@inithium/shared-contracts';
import { Container, Icon, Image, Text } from '@inithium/shared-ui-components';
import { typographyProps } from './content-typography.service';
import { useContentLinks } from './content-links.context';

const ALIGN_ITEMS = { start: 'start', center: 'center', end: 'end' } as const;

/**
 * The Image element (decisions 0098, 0116): an uploaded image by its asset id, as wide as its space unless sized,
 * with its style props, an optional caption and an optional link. A missing image (deleted, or not chosen yet) shows
 * a placeholder rather than a broken picture.
 */
export function ImageElementView({ props }: { props: ImageElementProps }) {
  const resolve = useContentLinks();
  const [failedId, setFailedId] = useState<string | null>(null);
  const {
    assetId,
    alt,
    decorative,
    caption,
    captionColor,
    captionTypography,
    align = 'center',
    link,
    hidden: _hidden,
    margin: _margin,
    animation: _animation,
    ...style
  } = props;
  const missing = !assetId || failedId === assetId;
  const width = style.width ?? 'full';

  const picture = missing ? (
    <Container
      width={width}
      maxWidth="full"
      height={style.height ?? 160}
      flex={{ direction: 'column', align: 'center', justify: 'center', gap: 8 }}
      radius={style.radius}
      bgColor={{ color: 'surface', intensity: 200 }}
      textColor={{ color: 'surface', intensity: 700 }}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : (alt ?? 'Image')}
      aria-hidden={decorative || undefined}
    >
      <Icon name="image-off" size={28} />
      <Text as="span" fontSize={13}>
        {assetId ? 'This image is missing' : 'No image chosen'}
      </Text>
    </Container>
  ) : (
    <Image {...style} width={width} src={assetUrl(assetId)} alt={alt} decorative={decorative} onError={() => setFailedId(assetId)} />
  );
  const target = link && !missing ? resolve(link) : undefined;

  return (
    <Container flex={{ direction: 'column', align: ALIGN_ITEMS[align], gap: 8 }}>
      {target?.href ? (
        // A plain <a> around the image: no component renders an anchor that wraps content (decision 0092).
        <a href={target.href} onClick={target.onClick} {...(target.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} style={{ display: 'block', maxWidth: '100%' }}>
          {picture}
        </a>
      ) : (
        picture
      )}
      {caption && (
        <Text
          as="span"
          {...typographyProps(captionTypography, { fontSize: 14 })}
          lineHeight={1.5}
          align={align}
          textColor={captionColor ?? { color: 'surface', intensity: 700 }}
        >
          {caption}
        </Text>
      )}
    </Container>
  );
}
