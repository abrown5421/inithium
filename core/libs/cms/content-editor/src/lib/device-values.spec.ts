import { describe, expect, it } from 'vitest';
import { deviceValues, isOverridden, readAt, writeAt, writeState } from './device-values.service';

describe('editing style props per device (decision 0116)', () => {
  it('stores a value for every size as a plain value', () => {
    expect(writeAt(undefined, 'desktop', 24, 0)).toBe(24);
    expect(deviceValues(24)).toEqual({ desktop: 24, tablet: 24, phone: 24 });
  });

  it('writes a phone override mobile first: phones as base, larger screens from md', () => {
    const value = writeAt(24, 'phone', 8, 0);
    expect(value).toEqual({ base: 8, md: 24 });
    expect(deviceValues(value)).toEqual({ desktop: 24, tablet: 24, phone: 8 });
    expect(isOverridden(value, 'phone')).toBe(true);
    expect(isOverridden(value, 'tablet')).toBe(false);
  });

  it('writes a tablet override, which phones follow until they have their own', () => {
    const value = writeAt(24, 'tablet', 16, 0);
    expect(value).toEqual({ base: 16, lg: 24 });
    expect(deviceValues(value)).toEqual({ desktop: 24, tablet: 16, phone: 16 });
    const all = writeAt(value, 'phone', 8, 0);
    expect(all).toEqual({ base: 8, md: 16, lg: 24 });
  });

  it('moves the sizes that follow Desktop, and keeps overrides', () => {
    const value = writeAt(writeAt(24, 'phone', 8, 0), 'desktop', 40, 0);
    expect(deviceValues(value)).toEqual({ desktop: 40, tablet: 40, phone: 8 });
  });

  it('removes an override, going back to plain when nothing differs', () => {
    const value = writeAt(24, 'phone', 8, 0);
    expect(writeAt(value, 'phone', undefined, 0)).toBe(24);
    expect(writeAt(writeAt(24, 'tablet', 16, 0), 'tablet', 24, 0)).toBe(24);
  });

  it('takes the field’s fallback where an override needs a value that was never set', () => {
    expect(writeAt(undefined, 'phone', 'column', 'row')).toEqual({ base: 'column', md: 'row' });
  });

  it('compares value objects by what they say', () => {
    const value = writeAt({ all: 16 }, 'tablet', { all: 16 }, { all: 0 });
    expect(value).toEqual({ all: 16 });
  });

  it('reads hand-written variants by the cascade', () => {
    expect(readAt({ base: 1, sm: 2, xl: 3 }, 'tablet')).toBe(2);
    expect(readAt({ base: 1, sm: 2, xl: 3 }, 'desktop')).toBe(3);
  });

  it('leaves states alone when editing devices, and edits them on their own', () => {
    const hovered = writeState('primary', 'hover', 'accent');
    expect(hovered).toEqual({ base: 'primary', hover: 'accent' });
    expect(writeAt(hovered, 'desktop', 'secondary', 'primary')).toEqual({ base: 'secondary', hover: 'accent' });
    expect(writeState(hovered, 'hover', undefined)).toBe('primary');
    expect(writeAt(writeAt(hovered, 'phone', 'red', 'primary'), 'phone', undefined, 'primary')).toEqual({ base: 'primary', hover: 'accent' });
  });
});
