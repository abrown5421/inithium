import { useState } from 'react';
import { assetKinds, type Asset, type AssetKind } from '@inithium/shared-contracts';
import { useGetAssetsQuery, useGetCurrentUserQuery, useGetStorageInfoQuery } from '@inithium/shared-data-access';
import { formatBytes, UploadDialog } from '@inithium/shared-media';
import { hasPermission } from '@inithium/shared-permissions';
import { Button, Container, Input, Loader, Select, Text } from '@inithium/shared-ui-components';
import { AssetDetails } from './asset-details.component';
import { AssetGrid } from './asset-grid.component';

const KIND_LABELS: Record<AssetKind, string> = {
  image: 'Images',
  font: 'Fonts',
  document: 'Documents',
  audio: 'Audio',
  video: 'Video',
};
// Members' avatars and banners are kept apart from the site's own files, under their own option (decision 0098).
const SHOW_OPTIONS = [
  { value: 'all', label: 'All files' },
  ...assetKinds.map((kind) => ({ value: kind, label: KIND_LABELS[kind] })),
  { value: 'members', label: 'Member uploads' },
];
type Show = AssetKind | 'all' | 'members';

/** How much of the database's storage quota is used, while assets are stored there. */
function StorageMeter() {
  const { data } = useGetStorageInfoQuery();
  if (!data) return null;
  if (!data.quotaBytes) {
    return (
      <Text as="p" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
        {formatBytes(data.usedBytes)} stored in cloud storage.
      </Text>
    );
  }
  const percent = Math.min(100, Math.round((data.usedBytes / data.quotaBytes) * 100));
  return (
    <Container flex={{ direction: 'column', gap: 6 }} width={{ base: 'full', md: 320 }}>
      <Text as="p" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
        {formatBytes(data.usedBytes)} of {formatBytes(data.quotaBytes)} used in the site’s database
      </Text>
      <Loader variant="progress" value={percent} width="full" color={percent >= 90 ? 'red' : 'primary'} label="Storage used" />
    </Container>
  );
}

/**
 * The CMS's Media screen (decision 0098): every uploaded file with search and a kind filter, how much storage is
 * used, uploading (with the crop or fit step for images), and a details modal to rename, describe, check where a file
 * is used and delete it.
 */
export function MediaScreen() {
  const { data: user } = useGetCurrentUserQuery();
  const [search, setSearch] = useState('');
  const [show, setShow] = useState<Show>('all');
  const { data: assets, isLoading, isError, refetch } = useGetAssetsQuery({
    q: search.trim() || undefined,
    ...(show === 'members' ? { group: 'members' as const } : show === 'all' ? {} : { kind: show }),
  });
  const [uploading, setUploading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const canDelete = user ? hasPermission(user.role, 'assets.delete') : false;
  // Read the open asset from the list, so edits show at once.
  const open: Asset | null = assets?.find((asset) => asset.id === openId) ?? null;

  return (
    <Container flex={{ direction: 'column', gap: 24 }}>
      <Container flex={{ direction: { base: 'column', md: 'row' }, align: { base: 'start', md: 'end' }, justify: 'between', gap: 16 }}>
        <Container flex={{ direction: 'column', gap: 4 }}>
          <Text as="h1" fontFamily="display" fontSize={28}>
            Media
          </Text>
          <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
            Images, documents, fonts, audio and video for your site. Every file is public once it’s used.
          </Text>
        </Container>
        <Button leadingIcon="upload" onClick={() => setUploading(true)}>
          Upload
        </Button>
      </Container>

      <StorageMeter />

      <Container grid={{ columns: { base: 1, md: 2 }, gap: 12 }}>
        <Input label="Search files" leadingIcon="search" value={search} onValueChange={setSearch} />
        <Select label="Show" value={show} onValueChange={(value) => setShow(value as Show)} options={SHOW_OPTIONS} />
      </Container>

      {isLoading ? (
        <Container flex={{ justify: 'center' }} padding={{ all: 32 }}>
          <Loader size={32} label="Loading files" />
        </Container>
      ) : isError ? (
        <Container flex={{ direction: 'column', align: 'start', gap: 12 }}>
          <Text as="p">We couldn’t load the files.</Text>
          <Button variant="outlined" onClick={() => void refetch()}>
            Try again
          </Button>
        </Container>
      ) : !assets?.length ? (
        <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
          {show === 'members' && !search ? 'No member uploads.' : search || show !== 'all' ? 'No files match.' : 'No files yet. Upload one to get started.'}
        </Text>
      ) : (
        <AssetGrid assets={assets} onSelect={(asset) => setOpenId(asset.id)} selectedId={openId ?? undefined} />
      )}

      <UploadDialog open={uploading} onClose={() => setUploading(false)} onUploaded={(asset) => setOpenId(asset.id)} />
      <AssetDetails asset={open} onClose={() => setOpenId(null)} canDelete={canDelete} />
    </Container>
  );
}
