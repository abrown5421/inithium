import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Text } from '@inithium/shared-ui-components';
import { FontPicker } from './font-picker.component';

// jsdom has no ResizeObserver, which Input's start adornment uses to place its text.
globalThis.ResizeObserver ??= class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

const BRAND = '0123456789abcdef01234567';
const families = [{ id: BRAND, name: 'Brand Serif' }];

describe('Text with a library family (decision 0112)', () => {
  afterEach(cleanup);

  it('reads the family’s variable, falling back to the body font', () => {
    render(<Text fontFamily={{ familyId: BRAND }}>Hello</Text>);
    const styles = screen.getByText('Hello').getAttribute('style') ?? '';
    expect(styles).toContain(`var(--font-family-${BRAND}, var(--font-body))`);
  });

  it('still reads a role’s variable', () => {
    render(<Text fontFamily="display">Hello</Text>);
    expect(screen.getByText('Hello').getAttribute('style')).toContain('var(--font-display)');
  });
});

describe('<FontPicker /> (decision 0111)', () => {
  afterEach(cleanup);

  it('offers the theme’s roles, then the library’s families, and picks one', async () => {
    const onValueChange = vi.fn();
    render(<FontPicker label="Font" families={families} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByLabelText('Font'));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'DisplayTheme font: branding and headings',
      'BodyTheme font: running text',
      'Brand Serif',
    ]);
    await userEvent.click(screen.getByRole('option', { name: 'Brand Serif' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ familyId: BRAND });
    expect((screen.getByLabelText('Font') as HTMLInputElement).value).toBe('Brand Serif');
  });

  it('offers no choice with emptyLabel, and leaves the roles out when asked', async () => {
    const onValueChange = vi.fn();
    render(<FontPicker label="Font" families={families} roles={false} emptyLabel="Block default" defaultValue={{ familyId: BRAND }} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByLabelText('Font'));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Block default', 'Brand Serif']);
    expect(screen.getByRole('option', { name: 'Brand Serif' }).getAttribute('aria-selected')).toBe('true');
    await userEvent.click(screen.getByRole('option', { name: 'Block default' }));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it('moves through the list with the keyboard', async () => {
    const onValueChange = vi.fn();
    render(<FontPicker label="Font" families={families} defaultValue="display" onValueChange={onValueChange} />);
    screen.getByLabelText('Font').focus();
    await userEvent.keyboard('{ArrowDown}');
    // The chosen font has focus when the list opens; down twice reaches the family.
    expect(document.activeElement?.textContent).toContain('Display');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith({ familyId: BRAND });
  });

  it('says so when the chosen family is no longer in the library', () => {
    render(<FontPicker label="Font" families={[]} value={{ familyId: BRAND }} />);
    expect((screen.getByLabelText('Font') as HTMLInputElement).value).toBe('Missing font (shown as Body)');
  });
});
