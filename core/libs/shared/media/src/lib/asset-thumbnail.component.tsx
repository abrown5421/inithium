import type { AssetKind } from '@inithium/shared-contracts';
import { Container, Icon, Image } from '@inithium/shared-ui-components';
import { KIND_ICONS } from './media.service';

export type AssetThumbnailProps = {
  /** The file's address. */
  url: string;
  kind: AssetKind;
  contentType?: string;
  /** Its side, in px. Default 96. */
  size?: number;
};

/** A square preview of an asset: the image itself (SVGs and icons fitted, others filling), or its kind's icon. */
export function AssetThumbnail({ url, kind, contentType, size = 96 }: AssetThumbnailProps) {
  return (
    <Container
      width={size}
      height={size}
      flex={{ align: 'center', justify: 'center' }}
      flexItem={{ shrink: 0 }}
      radius={{ all: 6 }}
      overflow={{ all: 'hidden' }}
      bgColor={{ color: 'surface', intensity: 200 }}
      textColor={{ color: 'surface', intensity: 700 }}
    >
      {kind === 'image' ? (
        <Image
          src={url}
          decorative
          width="full"
          height="full"
          fit={contentType === 'image/svg+xml' || contentType === 'image/x-icon' ? 'contain' : 'cover'}
        />
      ) : (
        <Icon name={KIND_ICONS[kind]} size={Math.round(size * 0.4)} />
      )}
    </Container>
  );
}
