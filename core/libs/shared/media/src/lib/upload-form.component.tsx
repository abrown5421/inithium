import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import {
  acceptedExtensions,
  assetPurposeKinds,
  MAX_ASSET_BYTES,
  type Asset,
  type AssetPurpose,
  type ColorValue,
} from '@inithium/shared-contracts';
import { readApiFailure, useAlerts, useUploadAssetMutation } from '@inithium/shared-data-access';
import { Button, Checkbox, Container, Icon, Input, RadioGroup, Select, Text, toCssColor } from '@inithium/shared-ui-components';
import { ColorPicker, ImageCropper, renderCrop, type ImageCrop, type PickedColor } from '@inithium/shared-ui-composites';
import { CROP_SHAPES, CROPPABLE_TYPES, formatBytes, PURPOSE_LABELS, resolveCssColor } from './media.service';

/** The largest file accepted before processing (the API's limit); images are shrunk to 2 MB after. */
const MAX_PICK_BYTES = 25 * 1024 * 1024;

export type UploadFormProps = {
  /** What the file is for. Without it, the form asks, offering `purposes`. */
  purpose?: AssetPurpose;
  /** The purposes to offer when `purpose` isn't set. Default the staff ones. */
  purposes?: readonly AssetPurpose[];
  /** Called with the stored asset once it's uploaded. */
  onUploaded: (asset: Asset) => void;
  onCancel?: () => void;
};

const STAFF_PURPOSES: readonly AssetPurpose[] = ['content', 'logo', 'favicon', 'font', 'document'];

/** Members' own pictures: raster images only (decision 0098), described by the profile's name rather than alt text. */
const MEMBER_PURPOSES = new Set<AssetPurpose>(['avatar', 'banner']);
const MEMBER_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];

/**
 * Uploads one file (decision 0098): choose or drop it, then, for images, crop or fit it to a shape suited to its
 * purpose (a circle for avatars, a strip for banners), describe it, and for fonts confirm the licence. Images are
 * shrunk to 2 MB on the server; other files must already be under 2 MB. Problems show like every form's.
 */
export function UploadForm({ purpose: fixedPurpose, purposes = STAFF_PURPOSES, onUploaded, onCancel }: UploadFormProps) {
  const [purpose, setPurpose] = useState<AssetPurpose>(fixedPurpose ?? purposes[0] ?? 'content');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [alt, setAlt] = useState('');
  const [licence, setLicence] = useState(false);
  const [shapeValue, setShapeValue] = useState<string | null>(null);
  const [mode, setMode] = useState<'crop' | 'fit'>('crop');
  const [background, setBackground] = useState<PickedColor>({ color: 'surface', intensity: 50 });
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const crop = useRef<ImageCrop | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [uploadAsset, { isLoading }] = useUploadAssetMutation();
  const { show: showAlert, dismiss: dismissAlert } = useAlerts();
  const lastAlert = useRef<string | null>(null);

  // Release the preview's object URL when it's replaced or the form goes.
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const kinds = assetPurposeKinds[purpose];
  const shapes = CROP_SHAPES[purpose];
  const croppable = Boolean(file && CROPPABLE_TYPES.has(file.type) && shapes.length > 0);
  const shape = shapes.find((candidate) => candidate.value === shapeValue) ?? shapes[0];
  const aspect = shape?.aspect ?? (natural ? natural.width / natural.height : 1);
  const isFont = purpose === 'font';
  const memberPicture = MEMBER_PURPOSES.has(purpose);
  const isImage = Boolean(file?.type.startsWith('image/'));

  const fail = (message: string, title = 'We couldn’t upload this file') => {
    setProblem(message);
    if (lastAlert.current) dismissAlert(lastAlert.current);
    lastAlert.current = showAlert({ color: 'red', icon: 'circle-alert', title, message, urgent: true });
  };

  const choose = (chosen: File | undefined) => {
    if (!chosen) return;
    setProblem(null);
    if (chosen.size > MAX_PICK_BYTES) return fail(`This file is ${formatBytes(chosen.size)}. Files can be at most 25 MB to start with.`);
    const imageLike = chosen.type.startsWith('image/');
    if (!imageLike && chosen.size > MAX_ASSET_BYTES) {
      return fail(`This file is ${formatBytes(chosen.size)}. Files other than images can be at most 2 MB${chosen.type.startsWith('video/') ? ': only very short clips fit' : ''}.`);
    }
    setFile(chosen);
    setNatural(null);
    crop.current = null;
    setShapeValue(null);
    setMode('crop');
    setPreviewUrl(imageLike ? URL.createObjectURL(chosen) : null);
    if (!alt) setAlt(chosen.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
    // Read the image's own shape for the 'Its own shape' option.
    if (imageLike) {
      const probe = new window.Image();
      const probeUrl = URL.createObjectURL(chosen);
      probe.onload = () => {
        setNatural({ width: probe.naturalWidth, height: probe.naturalHeight });
        URL.revokeObjectURL(probeUrl);
      };
      probe.src = probeUrl;
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    choose(event.dataTransfer.files[0]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return fail('Choose a file first.');
    if (isFont && !licence) return fail('Confirm you may use this font on the web.');
    try {
      let body: Blob = file;
      let filename = file.name;
      if (croppable && previewUrl && crop.current) {
        const fill = mode === 'fit' ? resolveCssColor(toCssColor(background as ColorValue)) : undefined;
        body = await renderCrop(previewUrl, crop.current, { background: fill });
        filename = file.name.replace(/\.[^.]+$/, '') + (body.type === 'image/webp' ? '.webp' : '.png');
      }
      const asset = await uploadAsset({ file: body, filename, purpose, alt: isImage && !memberPicture ? alt.trim() : undefined, fontLicence: isFont && licence }).unwrap();
      if (lastAlert.current) dismissAlert(lastAlert.current);
      lastAlert.current = showAlert({ color: 'green', icon: 'circle-check', title: 'Uploaded', message: `${asset.filename} (${formatBytes(asset.size)}) is ready.` });
      onUploaded(asset);
    } catch (error) {
      const failure = readApiFailure(error);
      fail(failure.message ?? 'Something went wrong. Please try again.');
    }
  };

  const purposeOptions = purposes.map((value) => ({ value, label: PURPOSE_LABELS[value] }));

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Container flex={{ direction: 'column', gap: 16 }}>
        {!fixedPurpose && purposes.length > 1 && (
          <Select
            label="What it’s for"
            value={purpose}
            onValueChange={(value) => {
              setPurpose(value as AssetPurpose);
              setFile(null);
              setPreviewUrl(null);
            }}
            options={purposeOptions}
          />
        )}

        {/* A plain file input, hidden: no component opens the system's file chooser (decision 0092). */}
        <input
          ref={picker}
          type="file"
          hidden
          accept={(memberPicture ? MEMBER_EXTENSIONS : acceptedExtensions(kinds)).join(',')}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            choose(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <Container
          flex={{ direction: 'column', align: 'center', gap: 8 }}
          padding={{ all: 20 }}
          radius={{ all: 8 }}
          borderWidth={{ all: 2 }}
          borderStyle="dashed"
          borderColor={problem ? { color: 'red', intensity: 500 } : { color: 'surface', intensity: 500, opacity: 60 }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <Icon name="upload" size={24} textColor={{ color: 'surface', intensity: 600 }} />
          <Text as="p" fontSize={14} align="center">
            {file ? `${file.name} · ${formatBytes(file.size)}` : 'Drop a file here, or choose one.'}
          </Text>
          <Button variant="outlined" leadingIcon="folder-open" onClick={() => picker.current?.click()}>
            {file ? 'Choose another file' : 'Choose a file'}
          </Button>
          <Text as="p" fontSize={12} align="center" textColor={{ color: 'surface', intensity: 700 }}>
            {memberPicture
              ? 'A PNG, JPEG, WebP, GIF or AVIF picture. It’s shrunk to fit 2 MB.'
              : purpose === 'favicon'
                ? 'An ICO, PNG or SVG works best. ICO and SVG are kept as they are; other images become a PNG of up to 512 pixels.'
              : kinds.includes('image') && kinds.length === 1
              ? 'Images are shrunk to fit 2 MB. SVG and ICO files are kept as they are.'
              : 'Images are shrunk to fit 2 MB; other files must be under 2 MB.'}
          </Text>
          {problem && (
            <Text as="p" fontSize={12} role="alert" textColor={{ color: 'red', intensity: 600 }}>
              {problem}
            </Text>
          )}
        </Container>

        {croppable && previewUrl && shape && (
          <Container flex={{ direction: 'column', gap: 12 }}>
            {shapes.length > 1 && (
              <Select
                label="Shape"
                value={shape.value}
                onValueChange={setShapeValue}
                options={shapes.map((option) => ({ value: option.value, label: option.label }))}
              />
            )}
            <RadioGroup
              label="Fill the shape, or fit the whole image in it"
              orientation="horizontal"
              value={mode}
              onValueChange={(value) => setMode(value as 'crop' | 'fit')}
              options={[
                { value: 'crop', label: 'Crop to fill' },
                { value: 'fit', label: 'Fit inside' },
              ]}
            />
            {mode === 'fit' && <ColorPicker label="Background around the image" value={background} onValueChange={setBackground} />}
            <ImageCropper
              key={`${previewUrl}-${shape.value}-${aspect}`}
              src={previewUrl}
              aspect={aspect}
              shape={shape.round ? 'round' : 'rect'}
              mode={mode}
              background={mode === 'fit' ? background : undefined}
              onCropChange={(next) => {
                crop.current = next;
              }}
            />
          </Container>
        )}

        {file && isImage && !memberPicture && (
          <Input
            label="Description (alt text)"
            helperText="Describes the image for people who can’t see it. Each use can change it."
            value={alt}
            onValueChange={setAlt}
          />
        )}
        {file && isFont && (
          <Checkbox
            label="I have the right to use this font on the web"
            helperText="TTF and OTF fonts are converted to WOFF2, which browsers load faster."
            checked={licence}
            onCheckedChange={(checked) => setLicence(checked === true)}
          />
        )}

        <Container flex={{ direction: 'row', gap: 8 }}>
          <Button type="submit" leadingIcon="upload" loading={isLoading} disabled={!file}>
            Upload
          </Button>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Container>
      </Container>
    </form>
  );
}
