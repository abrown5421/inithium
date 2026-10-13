import { useState } from 'react';
import { polyPatternLimits, type PolyPattern, type PolyPatternColor } from '@inithium/shared-contracts';
import { Button, Container, Slider, Switch, Text } from '@inithium/shared-ui-components';
import { AutoIncrementingList } from '../auto-incrementing-list/auto-incrementing-list.component';
import { ColorPicker } from '../color-picker/color-picker.component';
import { Modal } from '../modal/modal.component';
import { PolyPatternCanvas } from './poly-pattern-canvas.component';
import { createPolySeed } from './poly-pattern.service';

const { cellSize: CELL, variance: VARIANCE, colors: COLORS } = polyPatternLimits;
const NEW_COLOR: PolyPatternColor = { color: 'primary', intensity: 500 };

export type PolyBannerEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The saved pattern; the editor starts from it each time it opens. */
  pattern: PolyPattern;
  /** The banner's size in px, so the preview has its shape and density. */
  width: number;
  height: number;
  onSave: (pattern: PolyPattern) => void;
  /** An uploaded picture is showing: saving switches back to the pattern, and the editor says so. */
  hasImage?: boolean;
  /** Adds an Upload a picture button, which closes the editor and calls this. */
  onUpload?: () => void;
};

/**
 * PolyBanner's editor (decision 0074): a Modal with a live preview, sliders for cell size and variance, and lists
 * of colour pickers for the two gradients. Changes stay in a draft until Save.
 */
export function PolyBannerEditor({ open, onOpenChange, pattern, width, height, onSave, hasImage = false, onUpload }: PolyBannerEditorProps) {
  const [draft, setDraft] = useState(pattern);
  // Each opening starts again from the saved pattern.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(pattern);
  }
  const change = (next: Partial<PolyPattern>) => setDraft((current) => ({ ...current, ...next }));

  const colorList = (axis: 'X' | 'Y', items: PolyPatternColor[], helperText: string, onItemsChange: (items: PolyPatternColor[]) => void) => (
    <AutoIncrementingList<PolyPatternColor>
      label={`${axis} colours`}
      helperText={helperText}
      itemLabel="colour"
      min={COLORS.min}
      max={COLORS.max}
      items={items}
      onItemsChange={onItemsChange}
      createItem={() => NEW_COLOR}
      renderItem={(item, index, update) => (
        <ColorPicker
          aria-label={`${axis} colour ${index + 1}`}
          value={item}
          onValueChange={({ color, intensity }) => update({ color, intensity })}
        />
      )}
    />
  );

  const save = () => {
    const { yColors, ...rest } = draft;
    onSave(yColors ? { ...rest, yColors } : rest);
    onOpenChange(false);
  };

  // A preview at most 200px tall, in the banner's shape.
  const [previewWidth, previewHeight] = width > 0 && height > 0 ? [width, height] : [1200, 300];

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit banner"
      description="Shape and colour the pattern. Changes apply when you save."
      maxWidth={640}
    >
      <Container flex={{ direction: 'column', gap: 20 }}>
        {hasImage && (
          <Text as="p" fontSize={14} padding={{ all: 12 }} radius={{ all: 8 }} bgColor={{ color: 'primary', intensity: 100 }} textColor={{ color: 'primary', intensity: 800 }}>
            Your uploaded picture is showing. Saving here switches back to a generated banner.
          </Text>
        )}
        <div
          className="ui-poly-preview"
          style={{ aspectRatio: `${previewWidth} / ${previewHeight}`, maxWidth: `calc(200px * ${previewWidth / previewHeight})` }}
        >
          <PolyPatternCanvas pattern={draft} width={previewWidth} height={previewHeight} label="Preview" />
        </div>
        <Slider
          label="Cell size"
          min={CELL.min}
          max={CELL.max}
          step={CELL.step}
          value={draft.cellSize}
          onValueChange={(cellSize) => change({ cellSize })}
          formatValue={(value) => `${value}px`}
          helperText="Larger cells make a coarser pattern."
        />
        <Slider
          label="Variance"
          min={VARIANCE.min}
          max={VARIANCE.max}
          step={VARIANCE.step}
          value={draft.variance}
          onValueChange={(variance) => change({ variance: Math.round(variance * 100) / 100 })}
          formatValue={(value) => value.toFixed(2)}
          helperText="0 is a regular grid; 1 is the most random."
        />
        {colorList('X', draft.xColors, 'The gradient from left to right.', (xColors) => change({ xColors }))}
        <Switch
          label="Same as X colours"
          checked={!draft.yColors}
          onCheckedChange={(same) => change({ yColors: same ? undefined : draft.xColors })}
        />
        {draft.yColors && colorList('Y', draft.yColors, 'The gradient from top to bottom.', (yColors) => change({ yColors }))}
        <Container flex={{ justify: 'between', align: 'center', gap: 8, wrap: 'wrap' }}>
          <Container flex={{ gap: 8, wrap: 'wrap' }}>
            <Button variant="ghost" leadingIcon="shuffle" onClick={() => change({ seed: createPolySeed() })}>
              Shuffle
            </Button>
            {onUpload && (
              <Button
                variant="ghost"
                leadingIcon="upload"
                onClick={() => {
                  onOpenChange(false);
                  onUpload();
                }}
              >
                Upload a picture
              </Button>
            )}
          </Container>
          <Container flex={{ gap: 8 }}>
            <Button variant="outlined" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{hasImage ? 'Use this banner' : 'Save'}</Button>
          </Container>
        </Container>
      </Container>
    </Modal>
  );
}
