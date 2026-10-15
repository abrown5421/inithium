import { useState } from 'react';
import { fontWeightLabel, richTextSizePresets, type RichTextStyleAttrs } from '@inithium/shared-contracts';
import { FontField, useFontWeights, type FontWeight } from '@inithium/cms-media';
import { Button, Container, Select } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { ColorField } from './editor-fields.component';

const SAME = 'same';

export type TextStyleDialogProps = {
  /** The style to start from (the selection's), or null while closed. */
  initial: RichTextStyleAttrs | null;
  /** Whether the selection is already restyled, so it can be cleared. */
  styled: boolean;
  /** Applies the chosen style to the selection; an empty one clears it. */
  onApply: (attrs: Partial<RichTextStyleAttrs>) => void;
  onClear: () => void;
  onClose: () => void;
};

/**
 * Restyles the selected words (decision 0115): a font (the theme's roles or a library family), a weight the font has,
 * a size relative to the surrounding text from a few presets, and a colour. "Same as the text" leaves each one alone.
 */
export function TextStyleDialog({ initial, styled, onApply, onClear, onClose }: TextStyleDialogProps) {
  const [draft, setDraft] = useState<Partial<RichTextStyleAttrs>>({});
  const [openedWith, setOpenedWith] = useState<RichTextStyleAttrs | null>(null);
  if (initial !== openedWith) {
    setOpenedWith(initial);
    if (initial) setDraft({ ...initial });
  }
  const weights = useFontWeights(draft.family);
  const change = (next: Partial<RichTextStyleAttrs>) => setDraft((current) => ({ ...current, ...next }));
  const sizeIsPreset = draft.size === undefined || richTextSizePresets.some((preset) => preset.value === draft.size);

  return (
    <Modal
      open={initial !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Text style"
      description="How the selected words look. Anything left as it is follows the text around them."
      maxWidth={480}
    >
      <Container flex={{ direction: 'column', gap: 18 }}>
        <FontField label="Font" emptyLabel="Same as the text" value={draft.family} onChange={(family) => change({ family })} />
        <Select
          label="Weight"
          value={draft.weight ? String(draft.weight) : SAME}
          onValueChange={(weight) => change({ weight: weight === SAME ? undefined : (Number(weight) as FontWeight) })}
          options={[
            { value: SAME, label: 'Same as the text' },
            ...weights.map((weight) => ({ value: String(weight), label: fontWeightLabel({ min: weight, max: weight }) })),
          ]}
          helperText="Chosen here, it wins over bold."
        />
        <Select
          label="Size"
          value={draft.size === undefined ? SAME : String(draft.size)}
          onValueChange={(size) => change({ size: size === SAME ? undefined : Number(size) })}
          options={[
            { value: SAME, label: 'Same as the text' },
            ...richTextSizePresets.map((preset) => ({ value: String(preset.value), label: `${preset.label} (${preset.value}×)` })),
            // A size saved outside the presets still shows.
            ...(sizeIsPreset ? [] : [{ value: String(draft.size), label: `${draft.size}×` }]),
          ]}
          helperText="Relative to the text around it, so it scales with headings on every screen."
        />
        <ColorField label="Colour" value={draft.color} onChange={(color) => change({ color })} initial={{ color: 'primary', intensity: 600 }} helperText="Off follows the text’s colour." />
        <Container flex={{ justify: 'between', gap: 8, wrap: 'wrap' }}>
          <Container flex={{ gap: 8 }}>
            <Button onClick={() => onApply(draft)}>Apply</Button>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Container>
          <Button variant="ghost" color="red" leadingIcon="remove-formatting" disabled={!styled} onClick={onClear}>
            Clear style
          </Button>
        </Container>
      </Container>
    </Modal>
  );
}
