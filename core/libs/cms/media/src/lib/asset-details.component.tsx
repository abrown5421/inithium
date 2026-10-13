import { useState } from 'react';
import { assetFileTypes, type Asset } from '@inithium/shared-contracts';
import {
  readApiFailure,
  useAlerts,
  useDeleteAssetMutation,
  useGetAssetUsageQuery,
  useUpdateAssetMutation,
} from '@inithium/shared-data-access';
import { AssetThumbnail, formatBytes, PURPOSE_LABELS } from '@inithium/shared-media';
import { Button, Container, Divider, Image, Input, Loader, Text } from '@inithium/shared-ui-components';
import { Drawer, Modal } from '@inithium/shared-ui-composites';

export type AssetDetailsProps = {
  /** The asset to show; the drawer is open while there is one. */
  asset: Asset | null;
  onClose: () => void;
  canDelete: boolean;
};

/** A row of the details list. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Container flex={{ direction: 'row', justify: 'between', gap: 12 }}>
      <Text as="span" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
        {label}
      </Text>
      <Text as="span" fontSize={14} align="end">
        {value}
      </Text>
    </Container>
  );
}

/**
 * One asset in a Drawer (decision 0098): a preview (audio and video play), its name and default alt text to edit,
 * its details and address, where it's used, and deleting it (refused while the site logo uses it).
 */
export function AssetDetails({ asset, onClose, canDelete }: AssetDetailsProps) {
  // Keep the last asset while the Drawer animates out, and start the form afresh for each one.
  const [shown, setShown] = useState(asset);
  const [form, setForm] = useState({ filename: asset?.filename ?? '', alt: asset?.alt ?? '' });
  if (asset && asset !== shown) {
    setShown(asset);
    setForm({ filename: asset.filename, alt: asset.alt ?? '' });
  }
  const target = asset ?? shown;
  const usage = useGetAssetUsageQuery(target?.id ?? '', { skip: !asset });
  const [updateAsset, updating] = useUpdateAssetMutation();
  const [deleteAsset, deleting] = useDeleteAssetMutation();
  const [confirming, setConfirming] = useState(false);
  const { show: showAlert } = useAlerts();
  if (!target) return null;

  const blocked = usage.data?.places.find((place) => place.blocking);
  const save = async () => {
    try {
      await updateAsset({ id: target.id, update: { filename: form.filename, alt: form.alt } }).unwrap();
      showAlert({ color: 'green', icon: 'circle-check', title: 'Saved', message: `${form.filename} is up to date.` });
    } catch (error) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t save the file', message: readApiFailure(error).message ?? 'Something went wrong.', urgent: true });
    }
  };
  const remove = async () => {
    try {
      await deleteAsset(target.id).unwrap();
      setConfirming(false);
      showAlert({ color: 'green', icon: 'trash-2', title: 'File deleted', message: `${target.filename} is gone.` });
      onClose();
    } catch (error) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t delete the file', message: readApiFailure(error).message ?? 'Something went wrong.', urgent: true });
    }
  };

  return (
    <>
      <Drawer open={asset !== null} onOpenChange={(open) => !open && onClose()} title={target.filename} description={PURPOSE_LABELS[target.purpose]} size={440}>
        <Container flex={{ direction: 'column', gap: 18 }}>
          <Container flex={{ justify: 'center' }} radius={{ all: 8 }} overflow={{ all: 'hidden' }} bgColor={{ color: 'surface', intensity: 200 }}>
            {target.kind === 'image' ? (
              <Image src={target.url} alt={target.alt} decorative={!target.alt} maxWidth="full" fit="contain" loading="eager" />
            ) : target.kind === 'audio' ? (
              // Plain media elements: the library has no player (decision 0092).
              <audio controls src={target.url} style={{ width: '100%', margin: 12 }} />
            ) : target.kind === 'video' ? (
              <video controls src={target.url} style={{ width: '100%', display: 'block' }} />
            ) : (
              <Container padding={{ all: 24 }}>
                <AssetThumbnail url={target.url} kind={target.kind} size={96} />
              </Container>
            )}
          </Container>

          <Input label="Name" value={form.filename} onValueChange={(filename) => setForm({ ...form, filename })} />
          {target.kind === 'image' && (
            <Input
              label="Default description (alt text)"
              helperText="Used wherever the image is placed, unless that place changes it."
              value={form.alt}
              onValueChange={(alt) => setForm({ ...form, alt })}
            />
          )}
          <Container flex={{ direction: 'row' }}>
            <Button leadingIcon="save" loading={updating.isLoading} onClick={() => void save()}>
              Save
            </Button>
          </Container>

          <Divider />
          <Container flex={{ direction: 'column', gap: 8 }}>
            <Fact label="Type" value={assetFileTypes[target.contentType]?.label ?? target.contentType} />
            <Fact label="Size" value={formatBytes(target.size)} />
            {target.width && target.height && <Fact label="Dimensions" value={`${target.width} × ${target.height}`} />}
            <Fact label="Uploaded" value={new Date(target.createdAt).toLocaleDateString()} />
            <Fact label="Stored in" value={target.driver === 'database' ? 'The site’s database' : 'Cloud storage'} />
          </Container>
          <Container flex={{ direction: 'row', gap: 8, wrap: 'wrap' }}>
            <Button variant="outlined" leadingIcon="copy" onClick={() => void navigator.clipboard.writeText(new URL(target.url, window.location.origin).href)}>
              Copy address
            </Button>
            <Button variant="outlined" leadingIcon="external-link" onClick={() => window.open(target.url, '_blank', 'noopener')}>
              Open
            </Button>
          </Container>

          <Divider />
          <Container flex={{ direction: 'column', gap: 8 }}>
            <Text as="h3" fontSize={13} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }}>
              WHERE IT’S USED
            </Text>
            {usage.isLoading ? (
              <Loader size={20} label="Checking where it’s used" />
            ) : usage.data?.places.length ? (
              <Container as="ul" flex={{ direction: 'column', gap: 4 }}>
                {usage.data.places.map((place) => (
                  <Container as="li" key={place.label}>
                    <Text as="span" fontSize={14}>
                      {place.label}
                    </Text>
                  </Container>
                ))}
              </Container>
            ) : (
              <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
                Not used anywhere yet.
              </Text>
            )}
          </Container>

          {canDelete && (
            <Container flex={{ direction: 'row' }}>
              <Button color="red" variant="outlined" leadingIcon="trash-2" disabled={Boolean(blocked)} onClick={() => setConfirming(true)}>
                {blocked ? 'In use as the logo' : 'Delete file'}
              </Button>
            </Container>
          )}
        </Container>
      </Drawer>

      <Modal open={confirming} onOpenChange={setConfirming} title={`Delete ${target.filename}?`} maxWidth={460}>
        <Container flex={{ direction: 'column', gap: 16 }}>
          <Text as="p">
            {usage.data?.places.length
              ? `It’s used in ${usage.data.places.length} ${usage.data.places.length === 1 ? 'place' : 'places'}, which will show a missing image. This can’t be undone.`
              : 'This can’t be undone.'}
          </Text>
          <Container flex={{ justify: 'end', gap: 8 }}>
            <Button variant="outlined" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
            <Button color="red" leadingIcon="trash-2" loading={deleting.isLoading} onClick={() => void remove()}>
              Delete file
            </Button>
          </Container>
        </Container>
      </Modal>
    </>
  );
}
