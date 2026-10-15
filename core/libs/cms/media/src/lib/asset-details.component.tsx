import { useState } from 'react';
import { assetFileTypes, fontWeightLabel, type Asset } from '@inithium/shared-contracts';
import {
  readApiFailure,
  useAlerts,
  useDeleteAssetMutation,
  useGetAssetUsageQuery,
  useUpdateAssetMutation,
} from '@inithium/shared-data-access';
import { AssetThumbnail, formatBytes, PURPOSE_LABELS } from '@inithium/shared-media';
import { Button, Container, Divider, Image, Input, Loader, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { FontFaces } from '@inithium/shared-ui-theme';
import { FontSample } from './font-sample.component';

export type AssetDetailsProps = {
  /** The asset to show; the modal is open while there is one. */
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

function SectionTitle({ children }: { children: string }) {
  return (
    <Text as="h3" fontSize={12} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }}>
      {children.toUpperCase()}
    </Text>
  );
}

/**
 * One asset in a Modal (decision 0098): a preview (audio and video play), its name and default alt text, its details
 * and where it's used, with Save, Copy address, Open and Delete in the footer. Delete asks for confirmation in the
 * footer, and is refused while the site logo or favicon uses the file.
 */
export function AssetDetails({ asset, onClose, canDelete }: AssetDetailsProps) {
  // Keep the last asset while the Modal animates out, and start the form afresh for each one.
  const [shown, setShown] = useState(asset);
  const [form, setForm] = useState({ filename: asset?.filename ?? '', alt: asset?.alt ?? '' });
  const [confirming, setConfirming] = useState(false);
  if (asset && asset.id !== shown?.id) {
    setShown(asset);
    setForm({ filename: asset.filename, alt: asset.alt ?? '' });
    setConfirming(false);
  }
  const target = asset ?? shown;
  const usage = useGetAssetUsageQuery(target?.id ?? '', { skip: !asset });
  const [updateAsset, updating] = useUpdateAssetMutation();
  const [deleteAsset, deleting] = useDeleteAssetMutation();
  const { show: showAlert } = useAlerts();
  if (!target) return null;

  const blocked = usage.data?.places.find((place) => place.blocking);
  const uses = usage.data?.places.length ?? 0;
  const changed = form.filename.trim() !== target.filename || form.alt.trim() !== (target.alt ?? '');
  const close = () => {
    setConfirming(false);
    onClose();
  };
  const save = async () => {
    try {
      await updateAsset({ id: target.id, update: { filename: form.filename.trim(), alt: form.alt.trim() } }).unwrap();
      showAlert({ color: 'green', icon: 'circle-check', title: 'Saved', message: `${form.filename.trim()} is up to date.` });
    } catch (error) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t save the file', message: readApiFailure(error).message ?? 'Something went wrong.', urgent: true });
    }
  };
  const remove = async () => {
    try {
      await deleteAsset(target.id).unwrap();
      showAlert({ color: 'green', icon: 'trash-2', title: 'File deleted', message: `${target.filename} is gone.` });
      close();
    } catch (error) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t delete the file', message: readApiFailure(error).message ?? 'Something went wrong.', urgent: true });
    }
  };

  const footer = confirming ? (
    <Container flex={{ direction: { base: 'column', sm: 'row' }, align: { base: 'start', sm: 'center' }, justify: 'between', gap: 12 }}>
      <Text as="p" fontSize={14} role="alert">
        <Text as="strong" fontWeight={600}>
          Delete {target.filename}?
        </Text>{' '}
        {uses > 0
          ? `It’s used in ${uses} ${uses === 1 ? 'place' : 'places'}, which will ${target.kind === 'font' ? 'lose it' : 'show a missing image'}. `
          : ''}This can’t be undone.
      </Text>
      <Container flex={{ gap: 8 }} flexItem={{ shrink: 0 }}>
        <Button color="red" leadingIcon="trash-2" loading={deleting.isLoading} onClick={() => void remove()}>
          Delete file
        </Button>
        <Button variant="outlined" onClick={() => setConfirming(false)}>
          Keep it
        </Button>
      </Container>
    </Container>
  ) : (
    <Container flex={{ direction: 'row', wrap: 'wrap', justify: 'between', gap: 8 }}>
      <Container flex={{ direction: 'row', wrap: 'wrap', gap: 8 }}>
        <Button leadingIcon="save" loading={updating.isLoading} disabled={!changed || !form.filename.trim()} onClick={() => void save()}>
          Save
        </Button>
        <Button
          variant="outlined"
          leadingIcon="copy"
          onClick={() => {
            void navigator.clipboard.writeText(new URL(target.url, window.location.origin).href);
            showAlert({ color: 'green', icon: 'copy', title: 'Address copied', message: 'Paste it wherever you need the file.' });
          }}
        >
          Copy address
        </Button>
        <Button variant="outlined" leadingIcon="external-link" onClick={() => window.open(target.url, '_blank', 'noopener')}>
          Open
        </Button>
      </Container>
      {canDelete && (
        <Button color="red" variant="outlined" leadingIcon="trash-2" disabled={Boolean(blocked)} onClick={() => setConfirming(true)}>
          Delete
        </Button>
      )}
    </Container>
  );

  return (
    <Modal open={asset !== null} onOpenChange={(open) => !open && close()} title={target.filename} description={PURPOSE_LABELS[target.purpose]} maxWidth={920} footer={footer}>
      <Container grid={{ columns: { base: 1, md: 2 }, gap: 24 }}>
        <Container
          flex={{ align: 'center', justify: 'center' }}
          minHeight={240}
          radius={{ all: 8 }}
          overflow={{ all: 'hidden' }}
          bgColor={{ color: 'surface', intensity: 200 }}
        >
          {target.kind === 'image' ? (
            <Image src={target.url} alt={target.alt} decorative={!target.alt} maxWidth="full" maxHeight={420} fit="contain" loading="eager" />
          ) : target.kind === 'audio' ? (
            // Plain media elements: the library has no player (decision 0092).
            <audio controls src={target.url} style={{ width: '100%', margin: 12 }} />
          ) : target.kind === 'video' ? (
            <video controls src={target.url} style={{ width: '100%', maxHeight: 420, display: 'block' }} />
          ) : target.kind === 'font' && target.font ? (
            <Container flex={{ direction: 'column', gap: 8 }} padding={{ all: 24 }} minWidth={0}>
              <FontFaces sets={[{ cssName: `Inithium Font file ${target.id}`, files: [{ url: target.url, contentType: target.contentType, weight: target.font.weight, style: target.font.style }] }]} />
              <FontSample
                cssName={`Inithium Font file ${target.id}`}
                fallback="sans"
                weight={Math.min(target.font.weight.max, Math.max(target.font.weight.min, 400))}
                italic={target.font.style === 'italic'}
              >
                <Text as="span" fontSize={40} lineHeight={1.2}>
                  Aa Bb Cc 123
                </Text>
              </FontSample>
            </Container>
          ) : (
            <AssetThumbnail url={target.url} kind={target.kind} size={96} />
          )}
        </Container>

        <Container flex={{ direction: 'column', gap: 16 }}>
          <Input label="Name" value={form.filename} onValueChange={(filename) => setForm({ ...form, filename })} />
          {target.kind === 'image' && (
            <Input
              label="Default description (alt text)"
              helperText="Used wherever the image is placed, unless that place changes it."
              value={form.alt}
              onValueChange={(alt) => setForm({ ...form, alt })}
            />
          )}
          <Divider />
          <Container flex={{ direction: 'column', gap: 8 }}>
            <SectionTitle>Details</SectionTitle>
            <Fact label="Type" value={assetFileTypes[target.contentType]?.label ?? target.contentType} />
            <Fact label="Size" value={formatBytes(target.size)} />
            {target.width && target.height ? <Fact label="Dimensions" value={`${target.width} × ${target.height}`} /> : null}
            {target.font ? <Fact label="Font" value={target.font.family} /> : null}
            {target.font ? <Fact label="Weight" value={fontWeightLabel(target.font.weight)} /> : null}
            {target.font ? <Fact label="Style" value={target.font.style === 'italic' ? 'Italic' : 'Upright'} /> : null}
            <Fact label="Uploaded" value={new Date(target.createdAt).toLocaleDateString()} />
            <Fact label="Stored in" value={target.driver === 'database' ? 'The site’s database' : 'Cloud storage'} />
          </Container>
          <Divider />
          <Container flex={{ direction: 'column', gap: 8 }}>
            <SectionTitle>Where it’s used</SectionTitle>
            {usage.isLoading ? (
              <Loader size={20} label="Checking where it’s used" />
            ) : uses ? (
              <Container as="ul" flex={{ direction: 'column', gap: 4 }}>
                {usage.data?.places.map((place) => (
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
            {canDelete && blocked && (
              <Text as="p" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
                {blocked.label.startsWith('Font family')
                  ? 'It can’t be deleted while it’s the only file of one of the site’s fonts. Choose another font in Settings, or add another file to the family, first.'
                  : `It can’t be deleted while it’s the site’s ${blocked.label.includes('favicon') ? 'favicon' : 'logo'}. Choose another in Settings first.`}
              </Text>
            )}
          </Container>
        </Container>
      </Container>
    </Modal>
  );
}
