import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import type { FontFamilyValue, FontPickerSerializableProps } from '@inithium/shared-contracts';
import { Container, Input, InputAdornment, Text, toCssColor, type AnimationRuntimeProps } from '@inithium/shared-ui-components';
import { fontPickerStyleSheet } from './font-picker.styles';

/** A library family the picker offers: its id and the name to show. */
export type FontPickerFamily = { id: string; name: string };

export type FontPickerProps = Omit<FontPickerSerializableProps, 'animation'> &
  AnimationRuntimeProps & {
    animation?: FontPickerSerializableProps['animation'];
    /** The chosen font: a theme role, `{ familyId }`, or undefined for none (the default). */
    value?: FontFamilyValue;
    defaultValue?: FontFamilyValue;
    /** Called with the chosen font, or undefined when the default option is chosen. */
    onValueChange?: (value: FontFamilyValue | undefined) => void;
    /** The font library's families, offered after the theme's roles. */
    families?: readonly FontPickerFamily[];
    /** Offer the theme's Display and Body fonts first. Default true. */
    roles?: boolean;
    /** Offers an option for no choice (undefined), with this label, e.g. 'Block default'. Leave out to require a font. */
    emptyLabel?: string;
    /** Marks the field invalid. A message replaces helperText while shown. Choosing a font hides it. */
    error?: boolean | string;
    disabled?: boolean;
    /** Inside a form, submits the choice under this name: the role, the family id, or empty. */
    name?: string;
    id?: string;
    'aria-label'?: string;
  };

type Option = { key: string; value: FontFamilyValue | undefined; label: string; caption?: string };

const keyOf = (value: FontFamilyValue | undefined) => (value === undefined ? '' : typeof value === 'string' ? value : value.familyId);

/**
 * A field for choosing a font (decision 0111): a read-only Input showing the choice, which opens a list below of the
 * theme's Display and Body fonts, then the font library's families, each drawn in its own font. Families draw through
 * the theme's font CSS (`ThemeFonts`), so the app must render it.
 */
export function FontPicker({
  value,
  defaultValue,
  onValueChange,
  families = [],
  roles = true,
  emptyLabel,
  error,
  disabled,
  name,
  id,
  'aria-label': ariaLabel,
  label,
  placeholder = 'Default',
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
}: FontPickerProps) {
  const panelId = useId();
  const field = useRef<HTMLInputElement>(null);
  const anchor = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const interactedOutside = useRef(false);
  const [current, setCurrent] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // The field is read-only, so its error is hidden when a font is chosen, until `error` changes again.
  const [errorHidden, setErrorHidden] = useState(false);
  const [previousError, setPreviousError] = useState(error);
  if (error !== previousError) {
    setPreviousError(error);
    setErrorHidden(false);
  }

  const picked = value ?? current;
  const options: Option[] = [
    ...(emptyLabel !== undefined ? [{ key: '', value: undefined, label: emptyLabel }] : []),
    ...(roles
      ? [
          { key: 'display', value: 'display' as const, label: 'Display', caption: 'Theme font: branding and headings' },
          { key: 'body', value: 'body' as const, label: 'Body', caption: 'Theme font: running text' },
        ]
      : []),
    ...families.map((family) => ({ key: family.id, value: { familyId: family.id }, label: family.name })),
  ];
  const pickedKey = keyOf(picked);
  const pickedOption = options.find((option) => option.key === pickedKey);
  // A family that's no longer in the library draws as body (decision 0112).
  const shownLabel = picked === undefined ? (emptyLabel ?? '') : (pickedOption?.label ?? 'Missing font (shown as Body)');

  const openPanel = () => {
    setActive(Math.max(0, options.findIndex((option) => option.key === pickedKey)));
    setOpen(true);
  };

  const choose = (next: FontFamilyValue | undefined) => {
    setCurrent(next);
    setErrorHidden(true);
    onValueChange?.(next);
    setOpen(false);
  };

  const openFromKeyboard = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      if (!disabled) openPanel();
    }
  };

  // The list is one tab stop: arrow keys move between fonts, Home and End jump, Enter or Space picks.
  const focusOption = (index: number) => {
    const next = Math.max(0, Math.min(index, options.length - 1));
    setActive(next);
    list.current?.querySelectorAll<HTMLElement>('[role=option]')[next]?.focus();
  };
  const moveInList = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption(active + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOption(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[active];
      if (option) choose(option.value);
    }
  };

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many pickers render. */}
      <style href="inithium-font-picker" precedence="default">
        {fontPickerStyleSheet}
      </style>
      <RadixPopover.Root open={open} onOpenChange={(next) => (next ? openPanel() : setOpen(false))}>
        <RadixPopover.Anchor asChild className="ui-font-picker">
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
              value={shownLabel}
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
              onClick={() => {
                if (disabled) return;
                if (open) setOpen(false);
                else openPanel();
              }}
              onKeyDown={openFromKeyboard}
              startAdornment={
                picked !== undefined ? (
                  <Text as="span" fontFamily={picked} fontSize={16} lineHeight={1} aria-hidden>
                    Aa
                  </Text>
                ) : undefined
              }
              endAdornment={<InputAdornment icon="chevron-down" />}
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
            aria-label={`${label ?? ariaLabel ?? 'Font'} options`}
            style={{ width: 'max(var(--radix-popover-trigger-width), 280px)', '--ui-font-picker-accent': toCssColor(color) } as CSSProperties}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              interactedOutside.current = false;
              focusOption(Math.max(0, options.findIndex((option) => option.key === pickedKey)));
            }}
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
              padding={{ all: 8 }}
              radius={{ all: 8 }}
              borderWidth={{ all: 1 }}
              borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
              bgColor={{ color: 'surface', intensity: 50 }}
              shadow="lg"
            >
              {options.length > 0 ? (
                <div ref={list} className="ui-font-list" role="listbox" aria-label="Fonts" onKeyDown={moveInList}>
                  {options.map((option, index) => (
                    <button
                      key={option.key || 'default'}
                      type="button"
                      role="option"
                      className="ui-font-option"
                      aria-selected={option.key === pickedKey}
                      tabIndex={index === active ? 0 : -1}
                      onFocus={() => setActive(index)}
                      onClick={() => choose(option.value)}
                    >
                      <Text as="span" fontFamily={option.value} fontSize={18} lineHeight={1.3} truncate={1} maxWidth="full">
                        {option.label}
                      </Text>
                      {option.caption && (
                        <Text as="span" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
                          {option.caption}
                        </Text>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
                  No fonts to choose from.
                </Text>
              )}
            </Container>
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
      {name && <input type="hidden" name={name} value={keyOf(picked)} />}
    </>
  );
}
