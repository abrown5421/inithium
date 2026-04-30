import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@inithium/utils';
import { Input } from '../../components/input/input';
import { Box } from '../../components/box/box';
import { Icon } from '../../components/icon/icon';
import type { ColorPickerProps } from './color-picker.types';

const isValidHex = (value: string): boolean =>
  /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

const normaliseInput = (raw: string): string => {
  const stripped = raw.startsWith('#') ? raw : `#${raw}`;
  return stripped.slice(0, 7);
};

const SWATCH_SIZE_MAP: Record<string, string> = {
  sm:   'size-3 rounded-sm',
  base: 'size-4 rounded',
  lg:   'size-5 rounded',
  xl:   'size-6 rounded-md',
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value: controlledValue,
  defaultValue = '#6366f1',
  onChange,
  variant = 'outlined',
  size = 'base',
  color = 'primary',
  label,
  description,
  disabled = false,
  placeholder = '#000000',
  className = '',
  inputClassName = '',
  labelClassName = '',
  descriptionClassName = '',
}) => {
  const isControlled = controlledValue !== undefined;

  const [internalHex, setInternalHex] = useState<string>(
    isControlled ? (controlledValue ?? defaultValue) : defaultValue,
  );
  const [inputText, setInputText] = useState<string>(
    isControlled ? (controlledValue ?? defaultValue) : defaultValue,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isControlled && controlledValue !== undefined) {
      setInternalHex(controlledValue);
      setInputText(controlledValue);
    }
  }, [controlledValue, isControlled]);

  const inputIsValid = isValidHex(inputText);

  const commitHex = useCallback(
    (hex: string) => {
      if (!isControlled) setInternalHex(hex);
      onChange?.(hex);
    },
    [isControlled, onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const normalised = normaliseInput(e.target.value);
      setInputText(normalised);
      if (isValidHex(normalised)) commitHex(normalised);
    },
    [commitHex],
  );

  const handlePickerChange = useCallback(
    (hex: string) => {
      setInputText(hex);
      commitHex(hex);
    },
    [commitHex],
  );

  const handleFocus = useCallback(() => {
    if (!disabled) setPickerOpen(true);
  }, [disabled]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPickerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pickerOpen]);

  const leadingAdornment = inputIsValid ? (
    <span
      className={cn(
        'shrink-0 border border-black/10 dark:border-white/10',
        SWATCH_SIZE_MAP[size] ?? SWATCH_SIZE_MAP.base,
      )}
      style={{ backgroundColor: internalHex }}
      aria-hidden
    />
  ) : (
    <Icon name="NoSymbolIcon" iconStyle="solid-20" size="sm" color="danger" aria-label="Invalid hex color" />
  );

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <Input
        variant={variant}
        size={size}
        color={color}
        label={label}
        description={description}
        invalid={!inputIsValid}
        disabled={disabled}
        placeholder={placeholder}
        value={inputText}
        onChange={handleInputChange}
        onFocus={handleFocus}
        leadingIcon={leadingAdornment}
        inputClassName={inputClassName}
        labelClassName={labelClassName}
        descriptionClassName={descriptionClassName}
        error={
          !inputIsValid && inputText.length > 1
            ? 'Enter a valid hex color (e.g. #ff6b6b)'
            : undefined
        }
      />

      {pickerOpen && (
        <div
          role="dialog"
          aria-label="Color picker"
          className={cn(
            'absolute z-50 bottom-full right-0 mb-2', 
            'p-3 rounded-xl',
            'bg-surface shadow-xl ring-1 ring-black/10 dark:ring-white/10',
          )}
        >
          <HexColorPicker color={internalHex} onChange={handlePickerChange} />

          <Box align="center" gap="2" pt="2">
            <span
              className="size-5 rounded shrink-0 border border-black/10 dark:border-white/10"
              style={{ backgroundColor: internalHex }}
            />
            <span className="font-mono text-xs text-on-surface/70 select-all flex-1">
              {internalHex.toUpperCase()}
            </span>
            <button
              type="button"
              aria-label="Close color picker"
              onClick={() => setPickerOpen(false)}
              className="text-on-surface/40 hover:text-on-surface transition-colors focus:outline-none"
            >
              <Icon name="XMarkIcon" iconStyle="solid-16" size="sm" aria-hidden />
            </button>
          </Box>
        </div>
      )}
    </div>
  );
};