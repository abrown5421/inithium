import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { iconNames } from 'lucide-react/dynamic';
import type { IconPickerSerializableProps } from '@inithium/shared-contracts';
import { Button, Container, Icon, Input, InputAdornment, Text, Tooltip, toCssColor, type AnimationRuntimeProps, type IconName } from '@inithium/shared-ui-components';
import { iconPickerStyleSheet } from './icon-picker.styles';

/** The most icons the panel shows at once; typing narrows the rest (decision 0085). */
export const ICON_PICKER_LIMIT = 60;
const COLUMNS = 8;

/**
 * The icons matching a search, best first: an exact name, then names starting with the search (shortest first),
 * then the rest containing it. Every word must appear, e.g. 'arrow up' finds 'arrow-up', then 'arrow-up-left'.
 */
export function searchIcons(query: string, names: readonly IconName[] = iconNames): IconName[] {
  const words = query.toLowerCase().trim().split(/[\s-]+/).filter(Boolean);
  if (words.length === 0) return [...names];
  const matches = names.filter((name) => words.every((word) => name.includes(word)));
  const first = words.join('-');
  const starting = matches.filter((name) => name.startsWith(first)).sort((a, b) => a.length - b.length || a.localeCompare(b));
  return [...starting, ...matches.filter((name) => !name.startsWith(first))];
}

export type IconPickerProps = Omit<IconPickerSerializableProps, 'animation'> &
  AnimationRuntimeProps & {
    animation?: IconPickerSerializableProps['animation'];
    /** The chosen icon, or undefined for none. */
    value?: IconName;
    defaultValue?: IconName;
    /** Called with the chosen icon, or undefined when cleared with 'No icon'. */
    onValueChange?: (value: IconName | undefined) => void;
    /** Marks the field invalid. A message replaces helperText while shown. Choosing an icon hides it. */
    error?: boolean | string;
    disabled?: boolean;
    /** Inside a form, submits the icon's name under this name. */
    name?: string;
    id?: string;
    'aria-label'?: string;
  };

/**
 * A field for choosing a Lucide icon (decision 0085): a read-only Input showing the icon and its name, which opens a
 * panel below with a search box and a grid of matching icons (up to 60 at a time), plus 'No icon' to clear it.
 */
export function IconPicker({
  value,
  defaultValue,
  onValueChange,
  error,
  disabled,
  name,
  id,
  'aria-label': ariaLabel,
  label,
  placeholder = 'No icon',
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
}: IconPickerProps) {
  const panelId = useId();
  const field = useRef<HTMLInputElement>(null);
  const anchor = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const interactedOutside = useRef(false);
  const [current, setCurrent] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  // The field is read-only, so its error is hidden when an icon is chosen, until `error` changes again.
  const [errorHidden, setErrorHidden] = useState(false);
  const [previousError, setPreviousError] = useState(error);
  if (error !== previousError) {
    setPreviousError(error);
    setErrorHidden(false);
  }

  const picked = value ?? current;
  const matches = useMemo(() => searchIcons(query), [query]);
  const shown = matches.slice(0, ICON_PICKER_LIMIT);

  // Every opening starts with an empty search, on the chosen icon when it's among the first shown.
  const openPanel = () => {
    setQuery('');
    setActive(Math.max(0, picked ? searchIcons('').slice(0, ICON_PICKER_LIMIT).indexOf(picked) : 0));
    setOpen(true);
  };

  const choose = (next: IconName | undefined) => {
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

  // The grid is one tab stop: arrow keys move between icons (8 to a row), Home and End jump, Enter or Space picks.
  const focusOption = (index: number) => {
    const next = Math.max(0, Math.min(index, shown.length - 1));
    setActive(next);
    grid.current?.querySelectorAll<HTMLElement>('[role=option]')[next]?.focus();
  };
  const moveInGrid = (event: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS };
    if (event.key in step) {
      event.preventDefault();
      if (event.key === 'ArrowUp' && active < COLUMNS) return document.getElementById(`${panelId}-search`)?.focus();
      focusOption(active + step[event.key]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusOption(shown.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const icon = shown[active];
      if (icon) choose(icon);
    }
  };

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many pickers render. */}
      <style href="inithium-icon-picker" precedence="default">
        {iconPickerStyleSheet}
      </style>
      <RadixPopover.Root open={open} onOpenChange={(next) => (next ? openPanel() : setOpen(false))}>
        <RadixPopover.Anchor asChild className="ui-icon-picker">
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
              value={picked ?? ''}
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
              startAdornment={picked ? <InputAdornment icon={picked} /> : undefined}
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
            aria-label={`${label ?? ariaLabel ?? 'Icon'} options`}
            style={{ width: 'max(var(--radix-popover-trigger-width), 320px)', '--ui-icon-picker-accent': toCssColor(color) } as CSSProperties}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              interactedOutside.current = false;
              document.getElementById(`${panelId}-search`)?.focus();
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
              flex={{ direction: 'column', gap: 12 }}
              padding={{ all: 12 }}
              radius={{ all: 8 }}
              borderWidth={{ all: 1 }}
              borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
              bgColor={{ color: 'surface', intensity: 50 }}
              shadow="lg"
            >
              <Input
                id={`${panelId}-search`}
                label="Search icons"
                leadingIcon="search"
                color={color}
                value={query}
                autoComplete="off"
                onValueChange={(next) => {
                  setQuery(next);
                  setActive(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' && shown.length > 0) {
                    event.preventDefault();
                    focusOption(0);
                  } else if (event.key === 'Enter' && shown[0]) {
                    event.preventDefault();
                    choose(shown[0]);
                  }
                }}
              />
              {shown.length > 0 ? (
                <div ref={grid} className="ui-icon-grid" role="listbox" aria-label="Icons" onKeyDown={moveInGrid}>
                  {shown.map((icon, index) => (
                    <Tooltip key={icon} content={icon} delay={400}>
                      <button
                        type="button"
                        role="option"
                        className="ui-icon-option"
                        aria-label={icon}
                        aria-selected={icon === picked}
                        tabIndex={index === active ? 0 : -1}
                        onFocus={() => setActive(index)}
                        onClick={() => choose(icon)}
                      >
                        <Icon name={icon} size={20} />
                      </button>
                    </Tooltip>
                  ))}
                </div>
              ) : (
                <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
                  No icons match “{query}”.
                </Text>
              )}
              <Container flex={{ justify: 'between', align: 'center', gap: 8 }}>
                <Text as="span" fontSize={12} textColor={{ color: 'surface', intensity: 700 }} aria-live="polite">
                  {matches.length > ICON_PICKER_LIMIT
                    ? `Showing ${ICON_PICKER_LIMIT} of ${matches.length}. Keep typing to narrow.`
                    : `${matches.length} ${matches.length === 1 ? 'icon' : 'icons'}`}
                </Text>
                <Button variant="ghost" color={color} leadingIcon="x" onClick={() => choose(undefined)} disabled={!picked}>
                  No icon
                </Button>
              </Container>
            </Container>
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
      {name && <input type="hidden" name={name} value={picked ?? ''} />}
    </>
  );
}
