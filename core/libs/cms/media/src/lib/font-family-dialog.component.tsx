import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  acceptedExtensions,
  fontFamilyCreateSchema,
  fontFilesOverlap,
  fontWeightLabel,
  type Asset,
  type FontFallback,
  type FontFamilyRecord,
  type FontWeightRange,
} from '@inithium/shared-contracts';
import {
  fieldErrorsFrom,
  focusFirstError,
  readApiFailure,
  useAlerts,
  useCreateFontFamilyMutation,
  useDeleteFontFamilyMutation,
  useGetAssetsQuery,
  useUpdateFontFamilyMutation,
  useUploadAssetMutation,
  type FieldErrors,
} from '@inithium/shared-data-access';
import { Button, Checkbox, Container, Divider, Input, RadioGroup, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { FontFaces } from '@inithium/shared-ui-theme';
import { FontSample } from './font-sample.component';

type Field = 'name' | 'fallback' | 'assetIds' | 'fontLicence';
const FIELDS: readonly Field[] = ['assetIds', 'fontLicence', 'name', 'fallback'];

/** A file in the dialog's list: saved in the family, or just uploaded or chosen. */
type FileRow = { assetId: string; filename: string; contentType: string; url: string; weight: FontWeightRange; style: 'normal' | 'italic' };

const FALLBACK_OPTIONS: { value: FontFallback; label: string; helperText: string }[] = [
  { value: 'sans', label: 'Sans serif', helperText: 'Clean letters without feet, like Arial' },
  { value: 'serif', label: 'Serif', helperText: 'Letters with feet, like Georgia' },
  { value: 'mono', label: 'Monospace', helperText: 'Every letter the same width, like code' },
];

const SAMPLE = 'The quick brown fox jumps over the lazy dog';
/** Each file previews under its own name, so files not saved yet can be shown. */
const fileCssName = (assetId: string) => `Inithium Font file ${assetId}`;
const describe = (row: Pick<FileRow, 'weight' | 'style'>) => `${fontWeightLabel(row.weight)}${row.style === 'italic' ? ', italic' : ''}`;
/** The weight to preview a file at: regular, inside a variable font's range. */
const previewWeight = (weight: FontWeightRange) => Math.min(weight.max, Math.max(weight.min, 400));

const rowFromAsset = (asset: Asset): FileRow | null =>
  asset.font ? { assetId: asset.id, filename: asset.filename, contentType: asset.contentType, url: asset.url, weight: asset.font.weight, style: asset.font.style } : null;

export type FontFamilyDialogProps = {
  open: boolean;
  onClose: () => void;
  /** The family to edit; leave out to create one. */
  family?: FontFamilyRecord | null;
  /** Every family in the library, to tell which uploaded fonts are free to add. */
  families: readonly FontFamilyRecord[];
};

/**
 * Creates or edits a font family (decision 0111): its files (uploaded here, or chosen from fonts already uploaded),
 * each with the weight and style read from the file; a name, suggested from the first file; and the generic family it
 * falls back to. Removing the family keeps its files in Media.
 */
export function FontFamilyDialog({ open, onClose, family, families }: FontFamilyDialogProps) {
  const [createFamily, creating] = useCreateFontFamilyMutation();
  const [updateFamily, updating] = useUpdateFontFamilyMutation();
  const [deleteFamily, deleting] = useDeleteFontFamilyMutation();
  const [uploadAsset] = useUploadAssetMutation();
  const fonts = useGetAssetsQuery({ kind: 'font' }, { skip: !open });
  const { show: showAlert } = useAlerts();
  const picker = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);

  const [openedFor, setOpenedFor] = useState<{ open: boolean; family?: FontFamilyRecord | null }>({ open: false });
  const [name, setName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [fallback, setFallback] = useState<FontFallback>('sans');
  const [rows, setRows] = useState<FileRow[]>([]);
  const [licence, setLicence] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  if (open !== openedFor.open || family !== openedFor.family) {
    setOpenedFor({ open, family });
    if (open) {
      setName(family?.name ?? '');
      setNameEdited(Boolean(family));
      setFallback(family?.fallback ?? 'sans');
      setRows(family?.files.map((file) => ({ ...file })) ?? []);
      setLicence(false);
      setConfirming(false);
      setErrors({});
    }
  }

  const fail = (found: FieldErrors<Field>, title: string, message: string) => {
    setErrors(found);
    showAlert({ color: 'red', icon: 'circle-alert', title, message, urgent: true });
    if (form.current) focusFirstError(FIELDS, found, form.current);
  };

  /** The list with a file added, or why it can't be: another file in it already covers its weight and style. */
  const addRow = (row: FileRow, current: FileRow[], suggestedName?: string): FileRow[] | string => {
    const clash = current.find((other) => fontFilesOverlap(other, row));
    if (clash) return `${row.filename} covers ${describe(row)}, which ${clash.filename} already does.`;
    if (!nameEdited && !name && suggestedName) setName(suggestedName);
    return [...current, row];
  };

  const inFamilies = new Set(families.filter((other) => other.id !== family?.id).flatMap((other) => other.files.map((file) => file.assetId)));
  const available = (fonts.data ?? []).filter((asset) => !inFamilies.has(asset.id) && !rows.some((row) => row.assetId === asset.id));

  const choose = (asset: Asset) => {
    const row = rowFromAsset(asset);
    // Fonts uploaded before their details were stored are read by the api when the family is saved.
    const next = addRow(row ?? { assetId: asset.id, filename: asset.filename, contentType: asset.contentType, url: asset.url, weight: { min: 400, max: 400 }, style: 'normal' }, rows, asset.font?.family);
    if (typeof next === 'string') return fail({ assetIds: next }, 'That file can’t be added', next);
    setRows(next);
    setErrors((current) => ({ ...current, assetIds: undefined }));
  };

  const needLicence = () =>
    fail({ fontLicence: 'Confirm you may use these fonts on the web' }, 'Confirm the licence first', 'Tick the box to confirm you may use these fonts on the web.');

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    let current = rows;
    const problems: string[] = [];
    for (const file of files) {
      try {
        const asset = await uploadAsset({ file, filename: file.name, purpose: 'font', fontLicence: true }).unwrap();
        const row = rowFromAsset(asset);
        if (!row) continue;
        const next = addRow(row, current, asset.font?.family);
        if (typeof next === 'string') problems.push(`${next} It’s uploaded, so you can use it in another family.`);
        else current = next;
      } catch (uploadError) {
        problems.push(`${file.name}: ${readApiFailure(uploadError).message ?? 'it couldn’t be uploaded.'}`);
      }
    }
    setRows(current);
    setUploading(false);
    if (problems.length) fail({ assetIds: problems[0] }, problems.length === 1 ? 'A file wasn’t added' : `${problems.length} files weren’t added`, problems.join(' '));
    else setErrors((existing) => ({ ...existing, assetIds: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalid = (found: FieldErrors<Field>) => fail(found, 'There were problems with this family', 'Check the highlighted fields.');
    const parsed = fontFamilyCreateSchema.safeParse({ name, fallback, assetIds: rows.map((row) => row.assetId) });
    if (!parsed.success) return invalid(fieldErrorsFrom<Field>(parsed.error.issues));
    setErrors({});
    try {
      const saved = family ? await updateFamily({ id: family.id, update: parsed.data }).unwrap() : await createFamily(parsed.data).unwrap();
      showAlert({ color: 'green', icon: 'circle-check', title: family ? 'Font family saved' : 'Font family added', message: `${saved.name} is in the font library.` });
      onClose();
    } catch (saveError) {
      const failure = readApiFailure(saveError);
      if (failure.issues) return invalid(fieldErrorsFrom<Field>(failure.issues));
      const message = failure.message ?? 'Something went wrong. Please try again.';
      const field = failure.field && (FIELDS as readonly string[]).includes(failure.field) ? (failure.field as Field) : undefined;
      fail(field ? { [field]: message } : {}, 'We couldn’t save the family', message);
    }
  };

  const remove = async () => {
    if (!family) return;
    try {
      await deleteFamily(family.id).unwrap();
      showAlert({ color: 'green', icon: 'circle-check', title: 'Font family removed', message: `${family.name}’s files are still in Media.` });
      onClose();
    } catch (removeError) {
      fail({}, 'We couldn’t remove the family', readApiFailure(removeError).message ?? 'Something went wrong. Please try again.');
    }
  };

  // Save sits on the left: alerts appear bottom right and would cover it.
  const footer = confirming ? (
    <Container flex={{ direction: 'column', gap: 8 }}>
      <Text as="p" fontSize={14}>
        Remove {family?.name}? Its files stay in Media as loose fonts.
      </Text>
      <Container flex={{ direction: 'row', wrap: 'wrap', gap: 8 }}>
        <Button color="red" leadingIcon="trash-2" loading={deleting.isLoading} onClick={() => void remove()}>
          Remove family
        </Button>
        <Button variant="outlined" onClick={() => setConfirming(false)}>
          Keep it
        </Button>
      </Container>
    </Container>
  ) : (
    <Container flex={{ direction: 'row', wrap: 'wrap', justify: 'between', gap: 8 }}>
      <Container flex={{ direction: 'row', wrap: 'wrap', gap: 8 }}>
        <Button leadingIcon="save" loading={creating.isLoading || updating.isLoading} disabled={uploading} onClick={() => form.current?.requestSubmit()}>
          {family ? 'Save' : 'Add family'}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </Container>
      {family && (
        <Button color="red" variant="outlined" leadingIcon="trash-2" onClick={() => setConfirming(true)}>
          Remove family
        </Button>
      )}
    </Container>
  );

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={family ? family.name : 'New font family'}
      description="A font’s files, one for each weight and style. Each file’s weight and style are read from the file."
      maxWidth={760}
      footer={footer}
    >
      <FontFaces sets={rows.map((row) => ({ cssName: fileCssName(row.assetId), files: [row] }))} />
      <form ref={form} onSubmit={handleSubmit} noValidate>
        <Container flex={{ direction: 'column', gap: 20 }}>
          <Container flex={{ direction: 'column', gap: 12 }}>
            <Text as="h3" fontSize={16} fontWeight={600}>
              Files
            </Text>
            {rows.length ? (
              <Container as="ul" flex={{ direction: 'column', gap: 8 }} aria-label="Files in this family">
                {rows.map((row) => (
                  <Container
                    as="li"
                    key={row.assetId}
                    flex={{ direction: 'row', align: 'center', gap: 12 }}
                    padding={{ x: 12, y: 8 }}
                    radius={{ all: 8 }}
                    bgColor={{ color: 'surface', intensity: 100 }}
                  >
                    <Container flex={{ direction: 'column', gap: 2 }} flexItem={{ grow: 1 }} minWidth={0}>
                      <FontSample cssName={fileCssName(row.assetId)} fallback={fallback} weight={previewWeight(row.weight)} italic={row.style === 'italic'}>
                        <Text as="span" fontSize={18} truncate={1}>
                          {SAMPLE}
                        </Text>
                      </FontSample>
                      <Text as="span" fontSize={12} textColor={{ color: 'surface', intensity: 700 }} truncate={1}>
                        {describe(row)} · {row.filename}
                      </Text>
                    </Container>
                    <Button
                      variant="ghost"
                      color="red"
                      leadingIcon="x"
                      aria-label={`Take ${row.filename} out of the family`}
                      onClick={() => setRows(rows.filter((other) => other.assetId !== row.assetId))}
                    >
                      Remove
                    </Button>
                  </Container>
                ))}
              </Container>
            ) : (
              <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
                No files yet. Upload a font, or add one you’ve uploaded before.
              </Text>
            )}
            {errors.assetIds && (
              <Text as="p" fontSize={13} textColor={{ color: 'red', intensity: 600 }} role="alert">
                {errors.assetIds === true ? 'Check the files' : errors.assetIds}
              </Text>
            )}

            {/* A plain file input, hidden: no component opens the system's file chooser (decision 0092). */}
            <input
              ref={picker}
              type="file"
              hidden
              multiple
              accept={acceptedExtensions(['font']).join(',')}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const files = [...(event.target.files ?? [])];
                event.target.value = '';
                if (files.length) void uploadFiles(files);
              }}
            />
            <Checkbox
              name="fontLicence"
              label="I may use these fonts on the web"
              helperText="Many desktop font licences don’t allow it. Check the font’s licence before uploading."
              checked={licence}
              onCheckedChange={(checked) => setLicence(checked === true)}
              error={errors.fontLicence}
            />
            <Container flex={{ direction: 'row', wrap: 'wrap', gap: 8 }}>
              <Button
                variant="outlined"
                leadingIcon="upload"
                loading={uploading}
                onClick={() => (licence ? picker.current?.click() : needLicence())}
              >
                Upload font files
              </Button>
            </Container>
            <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
              WOFF2, WOFF, TTF or OTF, up to 2 MB each. TTF and OTF are converted to WOFF2.
            </Text>

            {available.length > 0 && (
              <Container flex={{ direction: 'column', gap: 8 }}>
                <Text as="p" fontSize={14} fontWeight={500}>
                  Uploaded fonts not in a family
                </Text>
                <Container as="ul" flex={{ direction: 'row', wrap: 'wrap', gap: 8 }}>
                  {available.map((asset) => (
                    <Container as="li" key={asset.id}>
                      <Button variant="outlined" color="secondary" leadingIcon="plus" onClick={() => choose(asset)}>
                        {asset.filename}
                      </Button>
                    </Container>
                  ))}
                </Container>
              </Container>
            )}
          </Container>

          <Divider />

          <Input
            name="name"
            label="Name"
            required
            helperText="How the CMS lists the font. Suggested from the first file."
            value={name}
            error={errors.name}
            onValueChange={(next) => {
              setNameEdited(true);
              setName(next);
            }}
          />
          <RadioGroup
            name="fallback"
            label="Fallback"
            helperText="Shown while the font loads, or if it can’t."
            orientation="horizontal"
            value={fallback}
            onValueChange={(value) => setFallback(value as FontFallback)}
            options={FALLBACK_OPTIONS}
            error={errors.fallback}
          />
        </Container>
      </form>
    </Modal>
  );
}
