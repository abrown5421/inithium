import type { Asset } from '@inithium/shared-contracts';
import { AssetThumbnail, formatBytes } from '@inithium/shared-media';
import { Button, Container, Text } from '@inithium/shared-ui-components';

export type AssetGridProps = {
  assets: Asset[];
  /** Called with the asset clicked. */
  onSelect: (asset: Asset) => void;
  /** The asset to mark as chosen, if any. */
  selectedId?: string;
};

/** Assets as a grid of cards: a square preview, the file's name and its size. */
export function AssetGrid({ assets, onSelect, selectedId }: AssetGridProps) {
  return (
    <Container as="ul" grid={{ columns: { base: 2, sm: 3, md: 4, xl: 6 }, gap: 12 }} aria-label="Files">
      {assets.map((asset) => {
        const selected = asset.id === selectedId;
        return (
          <Container as="li" key={asset.id} minWidth={0}>
            <Container
              flex={{ direction: 'column', gap: 6 }}
              padding={{ all: 8 }}
              radius={{ all: 8 }}
              borderWidth={{ all: 2 }}
              borderColor={selected ? { color: 'primary', intensity: 500 } : { base: 'transparent', hover: { color: 'surface', intensity: 500, opacity: 40 } }}
              bgColor={selected ? { color: 'primary', intensity: 50 } : { color: 'surface', intensity: 50 }}
            >
              <Container flex={{ justify: 'center' }}>
                <AssetThumbnail url={asset.url} kind={asset.kind} contentType={asset.contentType} size={128} />
              </Container>
              <Button
                variant="link"
                color={{ color: 'surface', intensity: 900 }}
                aria-pressed={selected}
                onClick={() => onSelect(asset)}
                width="full"
                minWidth={0}
              >
                <Text as="span" fontSize={13} truncate={1}>
                  {asset.filename}
                </Text>
              </Button>
              <Text as="span" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
                {formatBytes(asset.size)}
                {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
              </Text>
            </Container>
          </Container>
        );
      })}
    </Container>
  );
}
