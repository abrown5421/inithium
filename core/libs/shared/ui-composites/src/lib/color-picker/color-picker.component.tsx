import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import {
  intensities,
  tailwindColors,
  themeColors,
  type ColorPickerSerializableProps,
  type SolidColorValue,
} from '@inithium/shared-contracts';
import { Container, Input, Slider, Tooltip, toCssColor, type AnimationRuntimeProps } from '@inithium/shared-ui-components';
import { Tabs } from '../tabs/tabs.component';
import { colorPickerStyleSheet } from './color-picker.styles';

/** A picked colour: a theme token or Tailwind colour at an intensity. */
export type PickedColor = Exclude<SolidColorValue, string>;
type ColorName = PickedColor['color'];
type Intensity = PickedColor['intensity'];

const DEFAULT_INTENSITY: Intensity = 500;
const SWATCH_COLUMNS = 6;

/** 'emerald' → 'Emerald'. */
const capitalise = (name: string) => name[0].toUpperCase() + name.slice(1);
/** The colour's English name, e.g. 'Emerald 500'. */
const colorName = (value: PickedColor) => `${capitalise(value.color)} ${value.intensity}`;
const isTheme = (name: ColorName) => (themeColors as readonly string[]).includes(name);

export type ColorPickerProps = Omit<ColorPickerSerializableProps, 'animation'> &
  AnimationRuntimeProps & {
    animation?: ColorPickerSerializableProps['animation'];
    value?: PickedColor;
    defaultValue?: PickedColor;
    onValueChange?: (value: PickedColor) => void;
    /** Marks the field invalid. A message replaces helperText while shown. Picking a colour hides it. */
    error?: boolean | string;
    disabled?: boolean;
    /** Inside a form, submits the colour under this name, e.g. 'emerald-500'. */
    name?: string;
    id?: string;
    'aria-label'?: string;
  };

/**
 * A field for choosing a colour (decisions 0056, 0067 and 0069): an Input showing the colour's name and a swatch,
 * which opens a panel below it with swatches (theme tokens, and Tailwind's colours in a second tab) and an
 * intensity slider from 50 to 950. Its value is a colour value, ready for any colour prop.
 */
export function ColorPicker({
  value,
  defaultValue,
  onValueChange,
  palette = 'all',
  error,
  disabled,
  name,
  id,
  'aria-label': ariaLabel,
  label,
  placeholder,
  helperText,
  required,
  variant,
  color = 'primary',
  padding,
  margin,
  width,
  minWidth,
  maxWidth,
  animation,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
}: ColorPickerProps) {
  const panelId = useId();
  const field = useRef<HTMLInputElement>(null);
  const anchor = useRef<HTMLElement>(null);
  const interactedOutside = useRef(false);
  const [current, setCurrent] = useState(defaultValue);
  const [pendingIntensity, setPendingIntensity] = useState<Intensity>(DEFAULT_INTENSITY);
  const [open, setOpen] = useState(false);

  // The field is read-only, so its error is hidden when a colour is picked, until `error` changes again.
  const [errorHidden, setErrorHidden] = useState(false);
  const [previousError, setPreviousError] = useState(error);
  if (error !== previousError) {
    setPreviousError(error);
    setErrorHidden(false);
  }

  const picked = value ?? current;
  const intensity = picked?.intensity ?? pendingIntensity;

  const choose = (next: PickedColor) => {
    setCurrent(next);
    setErrorHidden(true);
    onValueChange?.(next);
  };
  const pickColor = (name: string) => choose({ color: name as ColorName, intensity });
  const pickIntensity = (index: number) => {
    const next = intensities[index];
    if (picked) choose({ color: picked.color, intensity: next });
    else setPendingIntensity(next);
  };

  const openFromKeyboard = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      if (!disabled) setOpen(true);
    }
  };

  const grid = (colors: readonly ColorName[], gridLabel: string) => (
    <SwatchGrid colors={colors} picked={picked} intensity={intensity} label={gridLabel} onPick={pickColor} />
  );

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many pickers render. */}
      <style href="inithium-color-picker" precedence="default">
        {colorPickerStyleSheet}
      </style>
      <RadixPopover.Root open={open} onOpenChange={setOpen}>
        <RadixPopover.Anchor asChild className="ui-color-picker">
          <Container
            ref={anchor}
            margin={margin}
            width={width ?? 'full'}
            minWidth={minWidth}
            maxWidth={maxWidth}
            animation={animation}
            show={show}
            replay={replay}
            onEntranceEnd={onEntranceEnd}
            onExitEnd={onExitEnd}
          >
            <Input
              ref={field}
              id={id}
              readOnly
              value={picked ? colorName(picked) : ''}
              label={label}
              placeholder={placeholder}
              helperText={helperText}
              error={errorHidden ? undefined : error}
              required={required}
              disabled={disabled}
              variant={variant}
              color={color}
              padding={padding}
              aria-label={ariaLabel}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={open ? panelId : undefined}
              onClick={() => !disabled && setOpen((was) => !was)}
              onKeyDown={openFromKeyboard}
              endAdornment={
                <Container
                  width={20}
                  height={20}
                  radius={{ all: 4 }}
                  borderWidth={{ all: 1 }}
                  borderStyle={picked ? 'solid' : 'dashed'}
                  borderColor={{ color: 'surface', intensity: 500, opacity: 50 }}
                  bgColor={picked ?? 'transparent'}
                />
              }
            />
          </Container>
        </RadixPopover.Anchor>
        <RadixPopover.Portal>
          <RadixPopover.Content
            asChild
            id={panelId}
            side="bottom"
            align="start"
            sideOffset={4}
            collisionPadding={8}
            aria-label={`${label ?? ariaLabel ?? 'Colour'} options`}
            style={{ width: 'var(--radix-popover-trigger-width)', '--ui-color-picker-accent': toCssColor(color) } as CSSProperties}
            onOpenAutoFocus={() => (interactedOutside.current = false)}
            // A click on the field toggles the panel itself, so it isn't an outside click.
            onPointerDownOutside={(event) => {
              if (anchor.current?.contains(event.target as Node)) event.preventDefault();
            }}
            onInteractOutside={() => (interactedOutside.current = true)}
            // Return focus to the field, unless the user moved on to something else.
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (!interactedOutside.current) field.current?.focus();
            }}
          >
            <Container
              position={{ type: 'relative', z: 50 }}
              flex={{ direction: 'column', gap: 12 }}
              padding={{ all: 12 }}
              radius={{ all: 8 }}
              borderWidth={{ all: 1 }}
              borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
              bgColor={{ color: 'surface', intensity: 50 }}
              shadow="lg"
            >
              {palette === 'all' ? (
                <Tabs
                  color={color}
                  aria-label="Colour sets"
                  defaultValue={picked && !isTheme(picked.color) ? 'more' : 'theme'}
                  tabs={[
                    { value: 'theme', label: 'Theme', content: grid(themeColors, 'Theme colours') },
                    { value: 'more', label: 'More colours', content: grid(tailwindColors, 'More colours') },
                  ]}
                />
              ) : (
                grid(themeColors, 'Theme colours')
              )}
              <Slider
                label="Intensity"
                min={0}
                max={intensities.length - 1}
                value={intensities.indexOf(intensity)}
                onValueChange={pickIntensity}
                formatValue={(index) => String(intensities[index])}
                valueLabel="off"
                marks
                color={color}
              />
            </Container>
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
      {name && <input type="hidden" name={name} value={picked ? `${picked.color}-${picked.intensity}` : ''} />}
    </>
  );
}

/** A grid of swatches at the current intensity; the arrow keys move between them and pick. */
function SwatchGrid({
  colors,
  picked,
  intensity,
  label,
  onPick,
}: {
  colors: readonly ColorName[];
  picked?: PickedColor;
  intensity: Intensity;
  label: string;
  onPick: (name: string) => void;
}) {
  return (
    <RadixRadioGroup.Root asChild value={picked?.color ?? ''} onValueChange={onPick} aria-label={label} loop>
      <Container grid={{ columns: SWATCH_COLUMNS, gap: 8 }}>
        {colors.map((swatch) => {
          const swatchName = colorName({ color: swatch, intensity });
          return (
            <Tooltip key={swatch} content={swatchName} delay={300}>
              <RadixRadioGroup.Item
                value={swatch}
                className="ui-color-swatch"
                aria-label={swatchName}
                style={{ backgroundColor: toCssColor({ color: swatch, intensity }) }}
              />
            </Tooltip>
          );
        })}
      </Container>
    </RadixRadioGroup.Root>
  );
}
