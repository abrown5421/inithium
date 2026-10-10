import { useEffect, useState } from 'react';
import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { avatarLimits, avatarStyles, type AvatarFlip, type AvatarRecipe, type AvatarStyle } from '@inithium/shared-contracts';
import { Button, Container, Select, Slider, Text } from '@inithium/shared-ui-components';
import { ColorPicker, type PickedColor } from '../color-picker/color-picker.component';
import { Modal } from '../modal/modal.component';
import { AvatarArt } from './avatar-art.component';
import { avatarStyleName, createAvatarSeed, loadAvatarStyle, type AvatarStyleLicense } from './avatar.service';

const { rotate: ROTATE, scale: SCALE } = avatarLimits;
const DEFAULT_PICKED: PickedColor = { color: 'primary', intensity: 500 };
type Background = 'style' | 'none' | 'color';

const backgroundOf = (recipe: AvatarRecipe): Background =>
  recipe.backgroundColor === undefined ? 'style' : recipe.backgroundColor === 'transparent' ? 'none' : 'color';

/** The recipe to save: defaults left out, so stored recipes stay small. */
function tidy({ flip, rotate, scale, ...rest }: AvatarRecipe): AvatarRecipe {
  return {
    ...rest,
    ...(flip && flip !== 'none' ? { flip } : {}),
    ...(rotate && rotate !== 360 ? { rotate } : {}),
    ...(scale !== undefined && scale !== 100 ? { scale } : {}),
  };
}

export type AvatarEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The saved recipe; the editor starts from it each time it opens. */
  recipe: AvatarRecipe;
  name?: string;
  onSave: (recipe: AvatarRecipe) => void;
};

/**
 * Avatar's editor (decision 0075): a Modal with a large preview between ← and → (stepping through a history of
 * random seeds), the styles as thumbnails, and background, flip, rotate and scale. Changes stay in a draft until
 * Save.
 */
export function AvatarEditor({ open, onOpenChange, recipe, name, onSave }: AvatarEditorProps) {
  const [draft, setDraft] = useState(recipe);
  // The seeds seen while open, and where the preview is among them. The saved seed comes first.
  const [seeds, setSeeds] = useState([recipe.seed]);
  const [position, setPosition] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(recipe);
      setSeeds([recipe.seed]);
      setPosition(0);
    }
  }
  const change = (next: Partial<AvatarRecipe>) => setDraft((current) => ({ ...current, ...next }));

  const step = (by: 1 | -1) => {
    const next = position + by;
    if (next < 0) return;
    let seed = seeds[next];
    if (seed === undefined) {
      seed = createAvatarSeed();
      setSeeds([...seeds, seed]);
    }
    setPosition(next);
    change({ seed });
  };

  // Non-CC0 styles carry a credit, shown while the style is chosen.
  const [licensed, setLicensed] = useState<{ style: AvatarStyle; license?: AvatarStyleLicense }>();
  useEffect(() => {
    let current = true;
    loadAvatarStyle(draft.style)
      .then(({ license }) => current && setLicensed({ style: draft.style, license }))
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, [draft.style]);
  const license = licensed?.style === draft.style ? licensed.license : undefined;
  const credit = license && !license.name.startsWith('CC0') ? license.text ?? license.name : undefined;

  const background = backgroundOf(draft);
  const setBackground = (next: Background) =>
    change({ backgroundColor: next === 'style' ? undefined : next === 'none' ? 'transparent' : DEFAULT_PICKED });

  const save = () => {
    onSave(tidy(draft));
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit avatar"
      description="Pick a style, then use the arrows to look through avatars in it. Changes apply when you save."
      maxWidth={640}
    >
      <Container flex={{ direction: 'column', gap: 20 }}>
        <Container flex={{ align: 'center', justify: 'center', gap: 16 }}>
          <Button variant="ghost" leadingIcon="chevron-left" aria-label="Previous avatar" disabled={position === 0} onClick={() => step(-1)} padding={{ x: 6 }} />
          <div className="ui-avatar-preview">
            <AvatarArt recipe={draft} name={name} label="Preview" />
          </div>
          <Button variant="ghost" leadingIcon="chevron-right" aria-label="Next avatar" onClick={() => step(1)} padding={{ x: 6 }} />
        </Container>

        <Container flex={{ direction: 'column', gap: 8 }}>
          <Text as="span" fontSize={14} fontWeight={600} id="avatar-style-label">
            Style
          </Text>
          <RadixRadioGroup.Root
            className="ui-avatar-options"
            aria-labelledby="avatar-style-label"
            value={draft.style}
            onValueChange={(style) => change({ style: style as AvatarStyle })}
            loop
          >
            {avatarStyles.map((style) => (
              <RadixRadioGroup.Item key={style} value={style} className="ui-avatar-option" aria-label={avatarStyleName(style)}>
                <span className="ui-avatar-thumb">
                  <AvatarArt recipe={{ ...draft, style }} name={name} />
                </span>
                <span aria-hidden="true">{avatarStyleName(style)}</span>
              </RadixRadioGroup.Item>
            ))}
          </RadixRadioGroup.Root>
          {credit && (
            <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
              {credit}
            </Text>
          )}
        </Container>

        <Container grid={{ columns: 2, gap: 16 }}>
          <Select
            label="Background"
            value={background}
            onValueChange={(next) => setBackground(next as Background)}
            options={[
              { value: 'style', label: "The style's own" },
              { value: 'none', label: 'None' },
              { value: 'color', label: 'A colour' },
            ]}
          />
          <Select
            label="Flip"
            value={draft.flip ?? 'none'}
            onValueChange={(flip) => change({ flip: flip as AvatarFlip })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
              { value: 'both', label: 'Both' },
            ]}
          />
        </Container>
        {background === 'color' && (
          <ColorPicker
            label="Background colour"
            value={draft.backgroundColor === 'transparent' || typeof draft.backgroundColor !== 'object' ? DEFAULT_PICKED : draft.backgroundColor}
            onValueChange={(backgroundColor) => change({ backgroundColor })}
          />
        )}
        <Slider
          label="Rotate"
          min={ROTATE.min}
          max={ROTATE.max}
          step={ROTATE.step}
          value={draft.rotate ?? 0}
          onValueChange={(rotate) => change({ rotate })}
          formatValue={(value) => `${value}°`}
        />
        <Slider
          label="Scale"
          min={SCALE.min}
          max={SCALE.max}
          step={SCALE.step}
          value={draft.scale ?? 100}
          onValueChange={(scale) => change({ scale })}
          formatValue={(value) => `${value}%`}
        />

        <Container flex={{ justify: 'end', gap: 8 }}>
          <Button variant="outlined" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </Container>
      </Container>
    </Modal>
  );
}
