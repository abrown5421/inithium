import { useState } from 'react';
import { assetUrl, type Asset, type AssetKind, type AssetPurpose } from '@inithium/shared-contracts';
import { useGetAssetQuery } from '@inithium/shared-data-access';
import { AssetThumbnail, formatBytes } from '@inithium/shared-media';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { AssetPicker } from './asset-picker.component';

export type AssetFieldProps = {
  label: string;
  /** The chosen asset's id, if any. */
  value?: string;
  /** Called with the chosen asset, or `null` when it's removed. */
  onChange: (asset: Asset | null) => void;
  kind?: AssetKind;
  /** What a new upload is for. Default 'content'. */
  purpose?: AssetPurpose;
  helperText?: string;
  /** A reason the value is wrong; shown in red under the field. */
  error?: boolean | string;
  /** Hides Remove, for fields that must keep a file. */
  required?: boolean;
  /** The picker lists only files uploaded for `purpose` (e.g. favicons), not every file of the kind. */
  onlyPurpose?: boolean;
};

/**
 * A form field holding one asset (decision 0098): its thumbnail, name and size, and buttons to choose another from the
 * Media library (or upload one) and to remove it.
 */
export function AssetField({ label, value, onChange, kind, purpose, helperText, error, required, onlyPurpose }: AssetFieldProps) {
  const [picking, setPicking] = useState(false);
  const { data: asset, isError } = useGetAssetQuery(value ?? '', { skip: !value });

  return (
    <Container flex={{ direction: 'column', gap: 6 }}>
      <Text as="span" fontSize={13} fontWeight={500} textColor={{ color: 'surface', intensity: 800 }}>
        {label}
      </Text>
      <Container
        flex={{ align: 'center', gap: 12 }}
        padding={{ all: 8 }}
        radius={{ all: 8 }}
        borderWidth={{ all: 1 }}
        borderColor={error ? { color: 'red', intensity: 500 } : { color: 'surface', intensity: 500, opacity: 40 }}
      >
        {value && <AssetThumbnail url={asset?.url ?? assetUrl(value)} kind={asset?.kind ?? kind ?? 'image'} contentType={asset?.contentType} size={56} />}
        <Container flex={{ direction: 'column', gap: 2 }} flexItem={{ grow: 1 }} minWidth={0}>
          <Text as="span" fontSize={14} truncate={1}>
            {!value ? 'Nothing chosen' : asset ? asset.filename : isError ? 'This file is missing' : 'Loading…'}
          </Text>
          {asset && (
            <Text as="span" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
              {formatBytes(asset.size)}
              {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
            </Text>
          )}
        </Container>
        <Button variant="outlined" leadingIcon="images" onClick={() => setPicking(true)}>
          {value ? 'Change' : 'Choose'}
        </Button>
        {value && !required && (
          <Button variant="ghost" color="red" leadingIcon="x" aria-label={`Remove the ${label.toLowerCase()}`} padding={{ x: 6 }} onClick={() => onChange(null)} />
        )}
      </Container>
      {((typeof error === 'string' && error) || helperText) && (
        <Text as="span" fontSize={12} textColor={error ? { color: 'red', intensity: 500 } : { color: 'surface', intensity: 700 }} role={error ? 'alert' : undefined}>
          {typeof error === 'string' && error ? error : helperText}
        </Text>
      )}
      <AssetPicker
        open={picking}
        onClose={() => setPicking(false)}
        kind={kind}
        purpose={purpose}
        onlyPurpose={onlyPurpose}
        selectedId={value}
        title={`Choose the ${label.toLowerCase()}`}
        onPick={(picked) => {
          setPicking(false);
          onChange(picked);
        }}
      />
    </Container>
  );
}
