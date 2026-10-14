import { useState } from 'react';
import type { Asset, AssetKind, AssetPurpose } from '@inithium/shared-contracts';
import { useGetAssetsQuery } from '@inithium/shared-data-access';
import { UploadForm } from '@inithium/shared-media';
import { Button, Container, Input, Loader, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { AssetGrid } from './asset-grid.component';

export type AssetPickerProps = {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen (or newly uploaded) asset. */
  onPick: (asset: Asset) => void;
  /** The kind of file to offer, e.g. 'image'. Default every kind. */
  kind?: AssetKind;
  /** What a new upload is for. Default 'content'. */
  purpose?: AssetPurpose;
  /** Lists only files uploaded for `purpose`, e.g. favicons. */
  onlyPurpose?: boolean;
  /** The asset already chosen, marked in the grid. */
  selectedId?: string;
  title?: string;
};

/**
 * Chooses a file from the Media library in a Modal (decision 0098), with search, or uploads a new one in place (with
 * the crop or fit step) and picks it.
 */
export function AssetPicker({ open, onClose, onPick, kind, purpose = 'content', onlyPurpose = false, selectedId, title = 'Choose a file' }: AssetPickerProps) {
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const { data: assets, isLoading } = useGetAssetsQuery({ kind, purpose: onlyPurpose ? purpose : undefined, q: search.trim() || undefined }, { skip: !open });
  const close = () => {
    setUploading(false);
    onClose();
  };
  const pick = (asset: Asset) => {
    setUploading(false);
    onPick(asset);
  };

  return (
    <Modal open={open} onOpenChange={(next) => !next && close()} title={uploading ? 'Upload a file' : title} maxWidth={960}>
      {uploading ? (
        <UploadForm purpose={purpose} onUploaded={pick} onCancel={() => setUploading(false)} />
      ) : (
        <Container flex={{ direction: 'column', gap: 16 }}>
          <Container flex={{ direction: { base: 'column', sm: 'row' }, align: { base: 'stretch', sm: 'end' }, gap: 12 }}>
            <Container flexItem={{ grow: 1 }}>
              <Input label="Search files" leadingIcon="search" value={search} onValueChange={setSearch} />
            </Container>
            <Button leadingIcon="upload" onClick={() => setUploading(true)}>
              Upload new
            </Button>
          </Container>
          {isLoading ? (
            <Container flex={{ justify: 'center' }} padding={{ all: 32 }}>
              <Loader size={32} label="Loading files" />
            </Container>
          ) : !assets?.length ? (
            <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
              {search ? 'No files match.' : 'No files yet. Upload one to use it here.'}
            </Text>
          ) : (
            <Container maxHeight={480} overflow={{ y: 'auto' }} padding={{ all: 2 }}>
              <AssetGrid assets={assets} onSelect={pick} selectedId={selectedId} />
            </Container>
          )}
        </Container>
      )}
    </Modal>
  );
}
