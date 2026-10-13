import type { Asset } from '@inithium/shared-contracts';
import { AssetThumbnail, formatBytes } from '@inithium/shared-media';
import { Container, Text } from '@inithium/shared-ui-components';

export type AssetGridProps = {
  assets: Asset[];
  /** Called with the asset clicked. */
  onSelect: (asset: Asset) => void;
  /** The asset to mark as chosen, if any. */
  selectedId?: string;
};

/** Assets as a grid of cards: a square preview, the file's name and its size. The whole card is the button. */
export function AssetGrid({ assets, onSelect, selectedId }: AssetGridProps) {
  return (
    <Container as="ul" grid={{ columns: { base: 2, sm: 3, md: 4, xl: 6 }, gap: 12 }} aria-label="Files">
      {assets.map((asset) => {
        const selected = asset.id === selectedId;
        return (
          <Container as="li" key={asset.id} minWidth={0}>
            {/* A plain <button> around the card: Button is a fixed-height row and can't hold a card (decision 0092). */}
            <button
              type="button"
              aria-pressed={selected}
              aria-label={`${asset.filename}, ${formatBytes(asset.size)}`}
              onClick={() => onSelect(asset)}
              style={{ display: 'block', width: '100%', padding: 0, border: 0, background: 'none', font: 'inherit', color: 'inherit', textAlign: 'start', cursor: 'pointer', borderRadius: 8 }}
            >
              <Container
                flex={{ direction: 'column', gap: 6 }}
                padding={{ all: 8 }}
                radius={{ all: 8 }}
                borderWidth={{ all: 2 }}
                borderColor={selected ? { color: 'primary', intensity: 500 } : { base: 'transparent', hover: { color: 'primary', intensity: 500, opacity: 50 } }}
                bgColor={selected ? { color: 'primary', intensity: 50 } : { base: { color: 'surface', intensity: 50 }, hover: { color: 'surface', intensity: 100 } }}
              >
                <Container flex={{ justify: 'center' }}>
                  <AssetThumbnail url={asset.url} kind={asset.kind} contentType={asset.contentType} size={128} />
                </Container>
                <Text as="span" fontSize={13} fontWeight={500} truncate={1}>
                  {asset.filename}
                </Text>
                <Text as="span" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
                  {formatBytes(asset.size)}
                  {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
                </Text>
              </Container>
            </button>
          </Container>
        );
      })}
    </Container>
  );
}
